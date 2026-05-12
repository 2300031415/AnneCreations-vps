const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('grep -r "localhost:5000" /var/www/annecreations/Frontend | grep -v "node_modules" | head -n 10', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '187.127.129.143',
  port: 22,
  username: 'root',
  password: 'Anusha@38214961',
  readyTimeout: 600000,
});
