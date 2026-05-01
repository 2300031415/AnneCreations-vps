import paramiko
import json

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    stdin, stdout, stderr = ssh.exec_command('pm2 jlist')
    output = stdout.read().decode('utf-8', errors='ignore')
    
    try:
        apps = json.loads(output)
        for app in apps:
            print(f"App: {app.get('name')}, CWD: {app.get('pm2_env', {}).get('pm_cwd')}")
    except Exception as e:
        print("Failed to parse PM2 output:", e)

    ssh.close()

if __name__ == "__main__":
    main()
