import paramiko
import sys
import time

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def run_cmd(ssh, cmd):
    print(f"Executing: {cmd}", flush=True)
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    # Wait for the command to finish and print output line by line if possible or just wait
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    
    if out:
        print("STDOUT:", out, flush=True)
    if err:
        print("STDERR:", err, flush=True)
    return exit_status

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(hostname, username=username, password=password)
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    # 1. Rebuild Backend
    print("\n--- REBUILDING BACKEND ---")
    run_cmd(ssh, "cd /var/www/annecreations/Backend && rm -rf dist && npm run build")

    # 2. Rebuild Brochure
    print("\n--- REBUILDING BROCHURE ---")
    run_cmd(ssh, "cd /var/www/annecreations/brochure && npm run build")

    # 3. Rebuild Frontend
    print("\n--- REBUILDING FRONTEND ---")
    run_cmd(ssh, "cd /var/www/annecreations/Frontend && npm run build")

    # 4. Rebuild Admin
    print("\n--- REBUILDING ADMIN ---")
    run_cmd(ssh, "cd /var/www/annecreations/Admin && npm run build")

    # 5. Restart PM2
    print("\n--- RESTARTING PM2 SERVICES ---")
    run_cmd(ssh, "pm2 restart all")

    ssh.close()
    print("\nDone.")

if __name__ == "__main__":
    main()
