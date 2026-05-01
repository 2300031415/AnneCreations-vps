import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    print("--- Detailed /var/www/annecreations Usage ---")
    stdin, stdout, stderr = ssh.exec_command("du -sh /var/www/annecreations/* 2>/dev/null | sort -hr")
    print(stdout.read().decode('utf-8'))

    # Check for large log files in apps
    print("--- Large Logs in Backend/Admin/Frontend ---")
    stdin, stdout, stderr = ssh.exec_command("find /var/www/annecreations -name '*.log' -size +100M -ls")
    print(stdout.read().decode('utf-8'))

    ssh.close()

if __name__ == "__main__":
    main()
