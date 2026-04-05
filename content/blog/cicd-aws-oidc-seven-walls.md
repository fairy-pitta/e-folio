---
title: "7 Walls Between GitHub Actions and a Running Server — An AWS OIDC CI/CD Debugging Story"
date: "April 1, 2026"
excerpt: "Setting up CI/CD from GitHub Actions to an EC2 instance via OIDC authentication. Every step broke. Here's the full debugging log."
coverImage: "/og/blog-cicd-aws-oidc-seven-walls.png"
readTime: "10 min read"
tags: ["AWS", "CI/CD", "GitHub Actions", "DevOps"]
---

## The Goal

Simple enough: push to the `dev` branch, GitHub Actions deploys to an EC2 instance. We chose OIDC authentication (no long-lived credentials). The infrastructure was managed by an external partner, adding communication overhead to every debugging step.

It took days. Here are the seven walls.

## Wall 1: GitHub Actions Can't Assume the AWS Role

```
Error: Could not assume role with OIDC: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

The Trust Policy on the IAM role looked correct:

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
        "token.actions.githubusercontent.com:sub": "repo:OrgName/repo-name:ref:refs/heads/dev",
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      }
    }
  }]
}
```

**Root cause**: The role name in the workflow didn't match the actual role. The Trust Policy was pointing at a different role than what we were trying to assume. Had to get the external partner to verify the exact role ARN.

**Fix**: Confirmed the actual role name and updated the workflow.

## Wall 2: SSM Command Output Invisible

After OIDC worked, we used SSM (Systems Manager) to run commands on EC2. Commands were failing, but we couldn't see *why* — the output was empty.

**Root cause**: Missing `ssm:GetCommandInvocation` permission. We could *send* commands but not *read* their results.

**Fix**: Temporarily added the permission. Now we could actually debug.

## Wall 3: Wrong Directory Path

```
/srv/forval-crossgear: No such file or directory
```

**Root cause**: SSM was looking for `/srv/forval-crossgear`, but the actual repo was at `/home/ec2-user/srv/forval-crossgear`. The server setup documentation was outdated.

**Fix**: Updated the path in the SSM command. Also updated the documentation while at it.

## Wall 4: SSM Runs as Root, Git Refuses to Cooperate

```
fatal: detected dubious ownership in repository
```

SSM runs commands as `root` by default. The repository is owned by `ec2-user`. Git's `safe.directory` check blocks root from operating on another user's repo. Additionally, root's working directory defaults to `/usr/bin`, so relative paths to `.git` fail.

**Fix**: Wrapped everything in `sudo -u ec2-user bash -lc '...'` to run as the correct user with the correct environment:

```yaml
- name: Deploy via SSM
  run: |
    aws ssm send-command \
      --document-name "AWS-RunShellScript" \
      --parameters 'commands=["sudo -u ec2-user bash -lc \"cd /home/ec2-user/srv/forval-crossgear && git pull origin dev && ./restart.sh\""]' \
      --targets "Key=instanceIds,Values=${{ secrets.EC2_INSTANCE_ID }}"
```

## Wall 5: SSH Host Key Verification

```
The authenticity of host 'github.com' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

We'd set up a Deploy Key for the EC2 instance to pull from GitHub. But `known_hosts` didn't have GitHub's host key, and SSM can't answer interactive prompts.

**Fix**: SSH'd into the instance manually, ran `ssh -T git@github.com`, typed `yes`, and the host key was saved. One-time fix, but easy to miss in automation.

## Wall 6: Deploy Key Setup

The EC2 instance needed to `git pull` from a private repo. Personal access tokens are bad practice for machines. Deploy keys (read-only SSH keys) are the right approach.

Steps:
1. Generate an ed25519 key pair on EC2
2. Add the public key as a Deploy Key (read-only) on GitHub
3. Change the remote URL from HTTPS to SSH

```bash
# On EC2
ssh-keygen -t ed25519 -C "deploy@ec2" -f ~/.ssh/deploy_key -N ""
# Add public key to GitHub repo → Settings → Deploy keys
git remote set-url origin git@github.com:OrgName/repo-name.git
```

## Wall 7: SSM Command Syntax Collapse

The final boss. Our SSM command had grown into a monster with shell variables, nested quotes, and multi-line scripts. Somewhere in the JSON → bash → `bash -lc` expansion chain, the syntax collapsed. `$check_cmd` expanded incorrectly, quotes got eaten, and we got mysterious `syntax error` messages.

**Fix**: Scrapped the entire complex command. Wrote a minimal, known-good deployment script and called that instead:

```bash
#!/bin/bash
# deploy.sh — kept on EC2
cd /home/ec2-user/srv/forval-crossgear
git fetch origin dev
git reset --hard origin/dev
pip install -r requirements.txt
python manage.py migrate
sudo systemctl restart gunicorn
```

The SSM command became just: `sudo -u ec2-user bash -lc '/home/ec2-user/deploy.sh'`

## The Aftermath

Total time: approximately 2 days of active debugging, spread over a week due to the back-and-forth with the external infrastructure partner.

Key takeaways:

1. **OIDC is worth it** — no stored credentials, but the setup is finicky. Triple-check role ARNs.
2. **SSM needs read permissions too** — `SendCommand` without `GetCommandInvocation` is flying blind.
3. **Root vs. user matters** — always explicitly run as the intended user.
4. **Keep deployment scripts simple** — a plain bash script on the server beats inline SSM commands every time.
5. **Working with external infra partners** multiplies debugging time. Get direct console access if possible, even temporarily.

The CI/CD pipeline has been running reliably since. Every time it deploys in 30 seconds, I think about the days it took to get there.
