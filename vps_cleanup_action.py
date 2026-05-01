import paramiko

def run_vps_cleanup_action():
    hostname = '187.127.129.143'
    username = 'root'
    password = 'Anusha@38214961'

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(hostname, username=username, password=password)
        
        cleanup_commands = [
            "rm -rf /var/www/annecreations/Backend/Backup",
            "rm -f /var/www/annecreations/Frontend/frontend_next.tar.gz",
            "rm -f /var/www/annecreations/Admin/admin_full.tar.gz",
            "rm -rf /var/www/annecreations/Admin/.next/cache",
            "rm -rf /var/www/annecreations/Frontend/.next/cache",
            "rm -rf /var/www/annecreations/brochure/.next/cache",
            "pm2 flush",
            "apt-get clean",
        ]
        
        for cmd in cleanup_commands:
            print(f"Executing Cleanup: {cmd}")
            ssh.exec_command(cmd)
            
        # Rebuild commands
        rebuild_commands = [
            "cd /var/www/annecreations/Backend && npm run build",
            "cd /var/www/annecreations/Admin && npm run build",
            "cd /var/www/annecreations/Frontend && npm run build",
            "cd /var/www/annecreations/brochure && npm run build",
            "pm2 restart all",
        ]
        
        for cmd in rebuild_commands:
            print(f"Executing Rebuild: {cmd}")
            stdin, stdout, stderr = ssh.exec_command(cmd)
            # We want to wait for these to finish
            exit_status = stdout.channel.recv_exit_status()
            print(f"Finished with status: {exit_status}")
            
    finally:
        ssh.close()

if __name__ == "__main__":
    run_vps_cleanup_action()
