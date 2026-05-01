import paramiko

def run_vps_cleanup_check():
    hostname = '187.127.129.143'
    username = 'root'
    password = 'Anusha@38214961'

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(hostname, username=username, password=password)
        
        commands = [
            "df -h",
            "du -sh /var/www/annecreations/*",
            "du -sh /root/.pm2/logs/* | sort -rh | head -n 20",
            "du -sh /var/log/* | sort -rh | head -n 10",
            "find /var/www/annecreations -name 'node_modules' -type d -prune -exec du -sh {} +",
            "find /var/www/annecreations -name '.next' -type d -prune -exec du -sh {} +",
        ]
        
        for cmd in commands:
            print(f"--- Running: {cmd} ---")
            stdin, stdout, stderr = ssh.exec_command(cmd)
            print(stdout.read().decode('utf-8'))
            err = stderr.read().decode('utf-8')
            if err:
                print(f"Error: {err}")
                
    finally:
        ssh.close()

if __name__ == "__main__":
    run_vps_cleanup_check()
