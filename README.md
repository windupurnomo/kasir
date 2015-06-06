# Sidik API #

Sidik API. Dikembangakan menggunakan NodeJS dan PostgreSQL. Dokumentasi untuk mengkonsumsi api bisa dibaca di sini: [Dokumentasi Sidik API](http://sidikapi.github.io/)

### Program yang dibutuhkan ###

* [Git](http://git-scm.com/downloads)
* [NodeJS](https://nodejs.org/)


### Install Tools ###
Ikuti perintah berikut untuk menginstall tools yang dibutuhkan dalam projek ini

* npm install apidoc -g
* npm install nodemon -g


### Install API ###

* git clone https://[your-username]@bitbucket.org/sidik/sidik-api.git 
* cd sidik-api
* npm install
* apidoc -i routes/ -o docs/
* nodemon sidik.js

## Table of Contents ##
- [Paging](#paging)
- [Authentication](#Authentication)

Paging
---
Pada setiap method get telah disediakan standar request untuk mendapatkan data secara parsial (sebagian). Gunakan query string page dan limit.

Authentication
--------------
Setiap request (kecuali login) client harus menyertakan token pada request header. 
