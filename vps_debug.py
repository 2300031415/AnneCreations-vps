import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    stdin, stdout, stderr = ssh.exec_command('cat /var/www/annecreations/Backend/src/modules/orders/orders.service.ts | grep -C 10 orderTotal')
    output = stdout.read().decode('utf-8', errors='ignore')
    print("BACKEND TS FILE:")
    print(output)
    
    stdin, stdout, stderr = ssh.exec_command('grep -C 5 "NEXT_PUBLIC_API_URL" /var/www/annecreations/Admin/.env')
    print("ADMIN ENV:")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    ssh.close()

if __name__ == "__main__":
    main()
