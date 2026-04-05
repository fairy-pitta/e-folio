---
title: "7 Walls Between GitHub Actions and a Running Server — An AWS OIDC CI/CD War Story"
date: "April 1, 2026"
excerpt: "I just wanted to push to dev and have it deploy. OIDC, SSM, Git ownership errors, nested quote hell — every single step broke. Here's the full debugging log."
coverImage: "/og/blog-cicd-aws-oidc-seven-walls.png"
readTime: "12 min read"
tags: ["AWS", "CI/CD", "GitHub Actions", "DevOps"]
---

## The Goal

Should've been simple: push to the `dev` branch, GitHub Actions deploys to an EC2 instance. Done. We went with [OIDC authentication](https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) so we wouldn't have long-lived AWS credentials sitting in GitHub Secrets like a ticking time bomb. The infrastructure was managed by a separate team, which meant every "can you check this?" took hours, not seconds.

It took *days*. Here are the seven walls I hit setting up CI/CD for a Django app deployed on EC2.

## Wall 1: GitHub Actions Can't Assume the AWS Role

```
Error: Could not assume role with OIDC: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

The classic. I was using [`aws-actions/configure-aws-credentials`](https://github.com/aws-actions/configure-aws-credentials) with OIDC, and the Trust Policy on the IAM role *looked* correct:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:sub": "repo:your-org/your-repo:ref:refs/heads/dev",
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      }
    }
  }]
}
```

I stared at this for way too long. Everything matched — the org, the repo, the branch. Except it didn't. The role ARN in my workflow was pointing at a *completely different role* than the one with this trust policy attached. The infra team had set up multiple roles and I'd grabbed the wrong one.

A few things I learned the hard way here:

- You **must** have `id-token: write` in your workflow's `permissions` block, or GitHub won't even request the OIDC token. The action just silently falls back to looking for access keys and gives you a cryptic "could not load credentials" error. Helpful!
- If you need to match multiple branches (like `dev` and `staging`), use `StringLike` with wildcards instead of `StringEquals`. `StringEquals` does exact matching only — no `*` or `?` support. I didn't need this here, but it's the kind of thing that'll bite you at 11pm. See the [AWS docs on condition operators](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html).
- Triple-check your role ARN. Then check it again.

**Fix**: Got the infra team to confirm the exact role ARN. Updated the workflow. Felt stupid.

## Wall 2: SSM Command Output — Flying Blind

After OIDC finally worked (sweet relief), I used [AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html) to run commands on the EC2 instance. SSM is great for this — no SSH port to expose, no keys to manage, everything goes through IAM. Commands were failing, but I couldn't see *why*. The output was just... empty. Nothing. A void.

Imagine trying to debug a deployment where every error message is `/dev/null`. That's `SendCommand` without `GetCommandInvocation`.

**Root cause**: Missing `ssm:GetCommandInvocation` permission on the IAM role. I could *send* commands but not *read their results*. Who designs an API where you can execute commands but not see what happened?

**Fix**: Added the permission. Suddenly I could actually see error messages. What a concept.

> **Why SSM over SSH?** SSM doesn't need open inbound ports, doesn't require key distribution, integrates with IAM and CloudTrail for audit logging, and it's free. The tradeoff is you're locked into AWS and the ergonomics are... different. For CI/CD specifically, SSM is almost always the right call. Alternatives include [AWS CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html) (full deployment orchestration with rollbacks, but heavier setup), EC2 Instance Connect (good for interactive sessions), or just plain SSH with keys stored in GitHub Secrets (works but you're back to managing credentials).

## Wall 3: Wrong Directory Path

```
/srv/my-app: No such file or directory
```

**Root cause**: The SSM command was looking for the app at `/srv/my-app`, but it actually lived at `/home/ec2-user/srv/my-app`. The server setup docs were wrong. Of course they were.

This one was quick once I could actually see the error output (thanks, Wall 2). But it's the kind of thing that would've been instant to diagnose with SSH access and completely opaque through SSM without the right permissions.

**Fix**: Updated the path. Updated the docs too, because I'm not a monster.

## Wall 4: SSM Runs as Root, Git Says No

```
fatal: detected dubious ownership in repository
```

This one's fun. SSM runs commands as `root` by default. The repo on disk is owned by `ec2-user`. Git 2.35.2+ has a [security feature (CVE-2022-24765)](https://github.blog/open-source/git/git-security-vulnerabilities-announced-2/) that refuses to operate on a repo owned by a different user. It's there to prevent privilege escalation through malicious `.git/config` or hooks — totally reasonable in general, totally annoying in this specific moment.

You *can* bypass it with `git config --global --add safe.directory /path/to/repo`, but that's a security workaround running as root on a production server. Don't do that.

**Fix**: Wrapped everything in `sudo -u ec2-user bash -lc '...'` so the commands run as the correct user with the correct environment:

```yaml
- name: Deploy via SSM
  run: |
    aws ssm send-command \
      --document-name "AWS-RunShellScript" \
      --parameters 'commands=["sudo -u ec2-user bash -lc \"cd /home/ec2-user/srv/my-app && git pull origin dev && ./restart.sh\""]' \
      --targets "Key=instanceIds,Values=${{ secrets.EC2_INSTANCE_ID }}"
```

This was the correct fix. Run as the user who owns the files. Don't punch holes in security features just because they're inconvenient.

## Wall 5: SSH Host Key Verification

Wall 5 was the dumbest one.

```
The authenticity of host 'github.com' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

We'd set up a Deploy Key so the EC2 instance could pull from GitHub. But `known_hosts` didn't have GitHub's host key. And SSM can't answer interactive prompts. So `git pull` just hung there, waiting for a "yes" that would never come, until the command timed out.

**Fix**: SSH'd into the instance manually, ran `ssh -T git@github.com`, typed `yes`, done. You could also do `ssh-keyscan github.com >> ~/.ssh/known_hosts` to automate it. One-time fix, but it's the kind of thing that makes you question your career choices when it takes 20 minutes to figure out why the deploy is timing out with no error message.

## Wall 6: Deploy Key Setup

The EC2 instance needed to `git pull` from a private repo. You could use a Personal Access Token, but PATs are bad practice for machines — they're tied to a person, they have broad permissions, and they don't expire unless you remember to set that up. [Deploy keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys) are the right approach: repo-scoped, read-only SSH keys.

```bash
# On EC2
ssh-keygen -t ed25519 -C "deploy@ec2" -f ~/.ssh/deploy_key -N ""
# Add the public key to: GitHub repo → Settings → Deploy keys (read-only)
git remote set-url origin git@github.com:your-org/your-repo.git
```

Make sure your SSH config points to the right key:

```bash
# ~/.ssh/config
Host github.com
  IdentityFile ~/.ssh/deploy_key
  IdentitiesOnly yes
```

Not hard, but there are a lot of small pieces that all have to be right. Wrong key, wrong remote URL format (HTTPS vs SSH), missing config — any of these will give you a generic "permission denied" with no further explanation.

## Wall 7: SSM Command Syntax Collapse

The final boss. And honestly? I should've seen it coming.

Our SSM command had grown into an unholy monster. Shell variables, nested quotes, multi-line scripts — all crammed into a JSON string, passed to bash, which called `bash -lc`, which ran the actual commands. Somewhere in the JSON → shell → subshell expansion chain, the syntax just... collapsed. Variables expanded at the wrong layer, quotes got eaten, and we got `syntax error` messages that pointed at perfectly valid-looking code.

I spent way too long trying to fix the quoting. Adding backslashes, switching between single and double quotes, trying heredocs inside JSON. It was cursed.

**Fix**: I scrapped the entire inline command. Wrote a deployment script, put it on the server, and called *that*:

```bash
#!/bin/bash
# deploy.sh — lives on EC2 at /home/ec2-user/deploy.sh
set -euo pipefail
cd /home/ec2-user/srv/my-app
git fetch origin dev
git reset --hard origin/dev
pip install -r requirements.txt
python manage.py migrate
sudo systemctl restart gunicorn
```

The SSM command became one line: `sudo -u ec2-user bash -lc '/home/ec2-user/deploy.sh'`

That's it. No nested quotes. No variable expansion games. No cursed JSON escaping. The deploy script is version-controllable, testable, and readable by humans. I should've done this from the start.

## The Aftermath

Total time: roughly two days of active debugging, stretched across a week because of the back-and-forth with the infra team. Every "can you check the role ARN?" or "can you add this permission?" had a turnaround measured in hours.

If I had to do this again, here's what I'd do differently:

- **Get temporary console access early.** Even read-only IAM access would've cut the debugging time in half. So much of this was "is the config what I think it is?" and I couldn't just *look*.
- **Start with the deploy script on the server.** Don't try to be clever with inline SSM commands. Just don't.
- **Test OIDC with a minimal workflow first.** Before wiring up the whole pipeline, just get `aws sts get-caller-identity` working. One step at a time.
- **Read the [`configure-aws-credentials` docs](https://github.com/aws-actions/configure-aws-credentials) carefully.** Especially the bit about `id-token: write` permissions. This trips up everyone.

The pipeline's been running reliably ever since. Every time it deploys in 30 seconds, I think about the days it took to get there. But honestly? I understand every piece of it now — the OIDC token exchange, the trust policy conditions, the SSM execution model, the Git ownership checks. There's something to be said for learning things the hard way. Not much, but something.
