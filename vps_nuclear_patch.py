import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def write_remote_file(ssh, path, content):
    print(f"Writing to {path}...")
    sftp = ssh.open_sftp()
    with sftp.open(path, 'w') as f:
        f.write(content)
    sftp.close()

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    # 1. Update orders.service.ts
    order_service_path = "/var/www/annecreations/Backend/src/modules/orders/orders.service.ts"
    sftp = ssh.open_sftp()
    with sftp.open(order_service_path, 'r') as f:
        content = f.read().decode('utf-8')
    
    if "total: totalAmount," not in content:
        content = content.replace("totalAmount,", "totalAmount,\n        total: totalAmount,")
        write_remote_file(ssh, order_service_path, content)
        print("Patched orders.service.ts")
    
    # 2. Update dashboard.controller.ts
    dash_ctrl_path = "/var/www/annecreations/Backend/src/modules/dashboard/dashboard.controller.ts"
    with sftp.open(dash_ctrl_path, 'r') as f:
        content = f.read().decode('utf-8')
    
    # Ensure total is mapped in recent orders
    if "total: order.orderTotal," not in content:
        content = content.replace("orderNumber: order.orderNumber,", "orderNumber: order.orderNumber,\n        total: order.orderTotal || 0,")
        write_remote_file(ssh, dash_ctrl_path, content)
        print("Patched dashboard.controller.ts")

    # 3. Rebuild and Restart
    print("Rebuilding Backend...")
    ssh.exec_command("cd /var/www/annecreations/Backend && npm run build && pm2 restart backend")
    
    print("Rebuilding Admin...")
    ssh.exec_command("cd /var/www/annecreations/Admin && npm run build && pm2 restart admin")

    ssh.close()
    print("Done.")

if __name__ == "__main__":
    main()
