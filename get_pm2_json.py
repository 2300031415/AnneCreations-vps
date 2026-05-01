import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    # Use a simpler way to find paths
    cmd = "pm2 jlist"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    res = stdout.read().decode('utf-8', errors='ignore')
    
    import json
    try:
        data = json.loads(res)
        for proc in data:
            print(f"Name: {proc['name']}, Path: {proc['pm2_env']['pm_cwd']}")
    except:
        print("Failed to parse JSON")

    ssh.close()

if __name__ == "__main__":
    main()
