import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    service_path = "/var/www/annecreations/Backend/src/modules/orders/orders.service.ts"
    sftp = ssh.open_sftp()
    with sftp.open(service_path, 'r') as f:
        content = f.read().decode('utf-8')
    
    # We will safely find:
    #       return {
    #        ...order,
    #        totalAmount,
    #        payment: {
    
    target = "        ...order,\n        totalAmount,"
    replacement = "        ...order,\n        totalAmount,\n        total: totalAmount,"
    
    if target in content and "total: totalAmount," not in content:
        content = content.replace(target, replacement)
        with sftp.open(service_path, 'w') as f:
            f.write(content)
        print("Backend mapped with 'total' field.")
        
        stdin, stdout, stderr = ssh.exec_command("cd /var/www/annecreations/Backend && npm run build && pm2 restart backend")
        print(stdout.read().decode('utf-8', errors='ignore'))
        print("Backend rebuilt.")
    else:
        print("Target string not found or already patched.")
        
    sftp.close()
    ssh.close()

if __name__ == "__main__":
    main()
