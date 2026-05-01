import paramiko

hostname = '187.127.129.143'
username = 'root'
password = 'Anusha@38214961'

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, username=username, password=password)

    # 1. Remove the huge tar.gz
    print("Deleting catalog_images.tar.gz...")
    ssh.exec_command("rm -f /root/catalog_images.tar.gz")

    # 2. Remove duplicate app folders in /root (Confirmed running from /var/www)
    print("Deleting duplicate app folders in /root...")
    ssh.exec_command("rm -rf /root/Backend /root/Frontend /root/annecreation-admin-main /root/brochure")

    # 3. Remove stray node files in /root
    print("Deleting stray node files in /root...")
    ssh.exec_command("rm -rf /root/node_modules /root/package-lock.json /root/package.json")

    # 4. Check MongoDB data size
    print("--- MongoDB Data Size ---")
    stdin, stdout, stderr = ssh.exec_command("du -sh /var/lib/mongodb")
    print(stdout.read().decode('utf-8'))

    # 5. Check Disk Free again
    print("--- Disk Usage After Cleanup ---")
    stdin, stdout, stderr = ssh.exec_command("df -h /")
    print(stdout.read().decode('utf-8'))

    ssh.close()

if __name__ == "__main__":
    main()
