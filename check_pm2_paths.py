import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    # Check PM2 process info for paths
    cmd = "pm2 jlist" # JSON output for easier parsing if I wanted, but I'll pull paths
    stdin, stdout, stderr = ssh.exec_command("pm2 desc backend | grep 'script path'")
    print("Backend Path:")
    print(stdout.read().decode('utf-8'))
    
    stdin, stdout, stderr = ssh.exec_command("pm2 desc frontend | grep 'script path'")
    print("Frontend Path:")
    print(stdout.read().decode('utf-8'))

    stdin, stdout, stderr = ssh.exec_command("pm2 desc admin | grep 'script path'")
    print("Admin Path:")
    print(stdout.read().decode('utf-8'))

    ssh.close()

if __name__ == "__main__":
    main()
