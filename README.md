# remote-tail

Server and client used for sharing of log files over TCP. 
Simple setup on the server and just as easy as `tail -f` on the clients.

##### Dependencies

- Nodejs v. >= 4.1.1
- Windows or any unix-based OS

### Install on server/clients

Install [nodejs](http://google.se) and then call `npm install -g remote-tail` in console of choice.

### Server setup

Share the file `errors.log` on `127.0.0.1` and port `1685`

```
$ remote-tail -e errors.log
```

Share the file `errors.log` on `192.168.10.26` and port `1094`

```
$ remote-tail -e errors.log -h 192.168.10.26 -p 1094
```

Share the file `errors.log` on `192.168.10.26` and port `1094` but only allow access for clients
coming from either `192.168.*` or `97.112.10.21`

```
$ remote-tail -e errors.log -h 192.168.10.26 -p 1094 -a 192.168.*,97.112.10.21
```

### Client setup

Consume the file exposed by `192.168.10.26` on port `1094`

```
$ remote-tail -h 192.168.10.26 -p 1094
```

### TODO

- SSL-support
- Sharing of several files from one server instance. 
