import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    print("--- Detailed Backend Usage ---")
    stdin, stdout, stderr = ssh.exec_command("du -sh /var/www/annecreations/Backend/* 2>/dev/null | sort -hr")
    print(stdout.read().decode('utf-8'))

    ssh.close()

if __name__ == "__main__":
    main()
