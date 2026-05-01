import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    cmd = "tail -n 200 ~/.pm2/logs/backend-out.log"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    res = stdout.read().decode('utf-8', errors='ignore')
    
    # Filter non-ascii
    safe_res = "".join(c if ord(c) < 128 else "?" for c in res)
    print(safe_res)

    ssh.close()

if __name__ == "__main__":
    main()
