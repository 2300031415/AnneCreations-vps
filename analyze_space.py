import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    # Check disk usage summary
    print("--- Disk Usage Summary ---")
    stdin, stdout, stderr = ssh.exec_command("du -sh /* 2>/dev/null | sort -hr")
    print(stdout.read().decode('utf-8'))

    # Check root dir files specifically (from screenshot)
    print("--- Root Directory Contents ---")
    stdin, stdout, stderr = ssh.exec_command("ls -lh /root")
    print(stdout.read().decode('utf-8'))

    # Check PM2 log sizes
    print("--- PM2 Log Sizes ---")
    stdin, stdout, stderr = ssh.exec_command("du -sh ~/.pm2/logs/*")
    print(stdout.read().decode('utf-8'))

    ssh.close()

if __name__ == "__main__":
    main()
