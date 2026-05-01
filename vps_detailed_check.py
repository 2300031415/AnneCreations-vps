import paramiko

def run_vps_detailed_check():
    hostname = '187.127.129.143'
    username = 'root'
    password = 'Anusha@38214961'

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(hostname, username=username, password=password)
        
        commands = [
            "pm2 jlist",  # Get JSON list to avoid encoding issues
            "free -h",
            "uptime",
        ]
        
        for cmd in commands:
            print(f"--- Running: {cmd} ---")
            stdin, stdout, stderr = ssh.exec_command(cmd)
            # Use errors='ignore' to avoid Crashes
            print(stdout.read().decode('utf-8', errors='ignore'))
            err = stderr.read().decode('utf-8', errors='ignore')
            if err:
                print(f"Error: {err}")
                
    finally:
        ssh.close()

if __name__ == "__main__":
    run_vps_detailed_check()
