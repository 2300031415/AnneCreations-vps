import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    cmd = "cat /etc/nginx/conf.d/anne_creations.conf"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print("Nginx Config After Certbot:")
    print(stdout.read().decode('utf-8'))

    ssh.close()

if __name__ == "__main__":
    main()
