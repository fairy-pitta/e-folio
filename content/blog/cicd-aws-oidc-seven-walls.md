---
title: "7 Walls Between GitHub Actions and a Running Server — An AWS OIDC CI/CD War Story"
date: "April 1, 2026"
excerpt: "I just wanted to push to dev and have it deploy. OIDC, SSM, Git ownership errors, nested quote issues — every single step broke. Here's the full debugging log."
coverImage: "/og/blog-cicd-aws-oidc-seven-walls.png"
readTime: "12 min read"
tags: ["AWS", "CI/CD", "GitHub Actions", "DevOps"]
draft: true
---

<!--
SKELETON — rewrite in your own words before publishing (then delete `draft: true` and this comment).
Facts below come from an earlier AI-written draft; check each one.

Removed claims to verify (unsourced or not from my own experience):
- SSM needs no open inbound ports, no key distribution, integrates with IAM and CloudTrail, and is free (kept only as a docs link)
- Alternatives to SSM: CodeDeploy (rollbacks, heavier setup), EC2 Instance Connect, plain SSH with keys in GitHub Secrets
- "SSM is almost always the right call for CI/CD"
- PATs are bad for machines: tied to a person, broad permissions, no expiry unless set
- Deploy keys are repo-scoped, read-only SSH keys (kept as a docs link; read-only was my setting, check)
- `StringEquals` is exact match only, no `*`/`?`; use `StringLike` for wildcards (kept as a docs link)
- Without `id-token: write` the action silently falls back to looking for access keys with a "could not load credentials" error (check exact message)
- Git 2.35.2+ safe.directory check is CVE-2022-24765, prevents privilege escalation via malicious .git/config or hooks
- Pipeline now deploys in 30 seconds
-->

## Context
- Goal: push to `dev` -> GitHub Actions deploys a Django app to EC2
- Auth: OIDC instead of long-lived AWS keys in GitHub Secrets ([docs](https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services))
- Infra managed by a separate team; every "can you check this?" took hours
- Total: about two days of active debugging, spread over a week

## What happened

### Wall 1: GitHub Actions can't assume the AWS role
- What happened: using [`aws-actions/configure-aws-credentials`](https://github.com/aws-actions/configure-aws-credentials) with OIDC

```
Error: Could not assume role with OIDC: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

- Trust policy looked correct:

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

- Cause: role ARN in the workflow pointed at a different role than the one with this trust policy; infra team had set up multiple roles
- Fix: infra team confirmed the exact ARN; updated the workflow
- Also noted: workflow needs `id-token: write` in `permissions`; multi-branch matching needs `StringLike` ([condition operators](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html)) (not needed here)

### Wall 2: SSM command output empty
- What happened: ran commands on EC2 via [AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html); commands failed but output was empty
- Cause: IAM role lacked `ssm:GetCommandInvocation`; could send commands but not read results
- Fix: added the permission; error messages became visible
- Why SSM over SSH: see the SSM docs above (one bullet, no comparison)

### Wall 3: Wrong directory path
- What happened:

```
/srv/my-app: No such file or directory
```

- Cause: SSM command used `/srv/my-app`; app actually at `/home/ec2-user/srv/my-app`; server setup docs were wrong
- Fix: corrected the path and the docs
- Only diagnosable quickly because Wall 2 was fixed first

### Wall 4: SSM runs as root, Git refuses
- What happened:

```
fatal: detected dubious ownership in repository
```

- Cause: SSM runs as `root`; repo owned by `ec2-user`; Git's ownership check ([CVE-2022-24765](https://github.blog/open-source/git/git-security-vulnerabilities-announced-2/))
- Rejected: `git config --global --add safe.directory ...` as root on a production server
- Fix: run as the owning user via `sudo -u ec2-user bash -lc '...'`:

```yaml
- name: Deploy via SSM
  run: |
    aws ssm send-command \
      --document-name "AWS-RunShellScript" \
      --parameters 'commands=["sudo -u ec2-user bash -lc \"cd /home/ec2-user/srv/my-app && git pull origin dev && ./restart.sh\""]' \
      --targets "Key=instanceIds,Values=${{ secrets.EC2_INSTANCE_ID }}"
```

### Wall 5: SSH host key verification
- What happened: `git pull` hung until the command timed out, no error in output

```
The authenticity of host 'github.com' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

- Cause: Deploy Key set up, but `known_hosts` on EC2 lacked GitHub's host key; SSM can't answer the prompt
- Fix: SSH'd in manually, ran `ssh -T git@github.com`, typed `yes`
- Alternative: `ssh-keyscan github.com >> ~/.ssh/known_hosts`
- Took about 20 minutes to find

### Wall 6: Deploy key setup
- Situation: EC2 needs to `git pull` a private repo; used a [deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys) instead of a personal access token

```bash
# On EC2
ssh-keygen -t ed25519 -C "deploy@ec2" -f ~/.ssh/deploy_key -N ""
# Add the public key to: GitHub repo → Settings → Deploy keys (read-only)
git remote set-url origin git@github.com:your-org/your-repo.git
```

```bash
# ~/.ssh/config
Host github.com
  IdentityFile ~/.ssh/deploy_key
  IdentitiesOnly yes
```

- Failure modes hit or seen: wrong key, HTTPS vs SSH remote URL, missing SSH config; all give generic "permission denied" (check which ones I actually hit)

### Wall 7: SSM command syntax collapse
- What happened: inline SSM command grew (shell variables, nested quotes, multi-line scripts in a JSON string -> bash -> `bash -lc`); got `syntax error` pointing at valid-looking code
- Cause: variables expanded at the wrong layer, quotes eaten across JSON -> shell -> subshell
- Tried: backslashes, switching quote styles, heredocs inside JSON; none worked
- Fix: dropped the inline command; script on the server, called from SSM:

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

- SSM command became: `sudo -u ec2-user bash -lc '/home/ec2-user/deploy.sh'`

## Takeaway
- Get temporary (read-only) console/IAM access early; much of the time was "is the config what I think it is?"
- Start with a deploy script on the server, not inline SSM commands
- Test OIDC with a minimal workflow first (`aws sts get-caller-identity`)
- Read the `configure-aws-credentials` docs, especially `id-token: write`

## Links
- [OIDC in AWS (GitHub docs)](https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)
- [Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html)
- [IAM condition operators](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html)
- [Git security announcement (CVE-2022-24765)](https://github.blog/open-source/git/git-security-vulnerabilities-announced-2/)
- [Deploy keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys)
