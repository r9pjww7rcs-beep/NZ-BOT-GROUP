const {
default: makeWASocket,
useMultiFileAuthState
}=require("@whiskeysockets/baileys")

const pino=require("pino")
const qrcode=require("qrcode-terminal")
const fs=require("fs")

const config=require("./config")
const catalog=require("./catalog")


function loadDB(){

return JSON.parse(
fs.readFileSync(
"./database.json"
)
)

}



function saveDB(data){

fs.writeFileSync(
"./database.json",
JSON.stringify(
data,
null,
2
)
)

}



function createMemberID(){

let db=loadDB()


if(db.member_ids.length===0){

for(let i=1;i<=100;i++){

db.member_ids.push({

id:
"NZ"+String(i).padStart(3,"0"),

status:"available",

used_by:null

})

}

saveDB(db)

}


}



function generateOrderID(){

let db=loadDB()

let number=
db.orders.length+1


return "ORD-"+
String(number).padStart(5,"0")

}



async function startBot(){


createMemberID()



const {state,saveCreds}=await useMultiFileAuthState(
"./session"
)



const sock=makeWASocket({

auth:state,

logger:pino({
level:"silent"
})

})



sock.ev.on(
"creds.update",
saveCreds
)



sock.ev.on(
"connection.update",
(update)=>{


const {
connection,
qr
}=update



if(qr){

qrcode.generate(
qr,
{
small:true
}
)

}



if(connection==="open"){

console.log(
"🎀 NZstore Bot Online"
)

}


})



sock.ev.on(
"messages.upsert",
async({messages})=>{


const msg=messages[0]


if(!msg.message)
return



const chat=
msg.key.remoteJid



const sender=
(
msg.key.participant ||
msg.key.remoteJid
)
.replace(
"@s.whatsapp.net",
""
)



const text=
(
msg.message.conversation ||
msg.message.extendedTextMessage?.text ||
""
).trim().toLowerCase()



let db=loadDB()
  // ================= MENU =================

if(text==="menu"){

await sock.sendMessage(
chat,
{
text:
`
🎀 NZstore MENU 🛒

🛒 Produk
💰 Harga
📌 Rules Order
📦 Cara Order
💳 Payment
👤 Admin

👥 Member
📝 Daftar Member
📊 Rekap Penjualan
🏆 Ranking

Ketik nama menu.
`
}
)

}



// ================= KATALOG =================


if(text==="streaming"){

await sock.sendMessage(
chat,
{
text:catalog.streaming
}
)

}


if(text==="editing"){

await sock.sendMessage(
chat,
{
text:catalog.editing
}
)

}


if(text==="ai"){

await sock.sendMessage(
chat,
{
text:catalog.ai
}
)

}


if(text==="music"){

await sock.sendMessage(
chat,
{
text:catalog.music
}
)

}


if(text==="vpn"){

await sock.sendMessage(
chat,
{
text:catalog.vpn
}
)

}


if(text==="aplikasi"){

await sock.sendMessage(
chat,
{
text:catalog.aplikasi
}
)

}


if(text==="kebsos"){

await sock.sendMessage(
chat,
{
text:catalog.kebsos
}
)

}


if(text==="streaming_lain"){

await sock.sendMessage(
chat,
{
text:catalog.streaming_lain
}
)

}



// ================= PAYMENT =================


if(text==="payment"){

await sock.sendMessage(
chat,
{
text:
`
💳 PAYMENT NZstore

${config.PAYMENT.METHOD}

Nomor:
${config.PAYMENT.NUMBER}

A/N:
${config.PAYMENT.NAME}


Setelah pembayaran:
Kirim bukti pembayaran ke admin.
`
}
)

}



// ================= RULES =================


if(text==="rules"){

await sock.sendMessage(
chat,
{
text:
`
📌 RULES ORDER NZstore

• Wajib tanya ketersediaan barang.
• Tunggu admin konfirmasi READY.
• Kirim format order dengan benar.
• Pastikan data akun benar.
• Kesalahan pembeli menjadi tanggung jawab pembeli.
• Jangan mengubah data akun.
• Jangan membagikan akun.
• Garansi mengikuti ketentuan produk.
• Komplain melalui admin.

Pembayaran berarti menyetujui aturan NZstore.
`
}
)

}



// ================= FORMAT ORDER =================


if(text==="format order"){

await sock.sendMessage(
chat,
{
text:
`
📦 FORMAT ORDER NZstore

Produk:
Paket:
Nama:
Email/Username:


Untuk KEBsos:

Produk:
Jumlah:
Username/Link:
Nama:


Tunggu konfirmasi admin.
`
}
)

}



// ================= ADMIN =================


if(text==="admin"){

await sock.sendMessage(
chat,
{
text:
`
👤 ADMIN NZstore

Bantuan:
• Order
• Stock
• Garansi
• Kendala akun


Admin:
${config.OWNER[0]}
`
}
)

}
  // ================= REGISTRASI MEMBER =================


if(text==="/daftar"){

await sock.sendMessage(
chat,
{
text:
`
📝 REGISTRASI MEMBER NZstore

Silakan masukkan ID Member.

Contoh:
NZ001
`
}
)

}



// ================= CEK ID MEMBER =================


if(
text.match(/^nz\d+$/i)
){

let id=text.toUpperCase()


let memberID=
db.member_ids.find(
(x)=>x.id===id
)



if(!memberID){

await sock.sendMessage(
chat,
{
text:
`
❌ ID Member tidak ditemukan.
`
}
)

return

}



if(memberID.status==="used"){

await sock.sendMessage(
chat,
{
text:
`
❌ ID ${id} sudah digunakan.
`
}
)

return

}



db.registrations.push({

phone:sender,

member_id:id,

step:"waiting_data"

})


saveDB(db)



await sock.sendMessage(
chat,
{
text:
`
✅ ID ${id} tersedia.

Silakan kirim data:

Nama:
Kota:
Username:
`
}
)

}



// ================= SIMPAN DATA MEMBER =================


if(
text.includes("nama:")
&&
text.includes("kota:")
&&
text.includes("username:")
){

let register=
db.registrations.find(
(x)=>x.phone===sender
)



if(!register){

return

}



let data=
msg.message.conversation.split("\n")



let nama=
data[0]
.replace(
"Nama:",
""
)
.trim()



let kota=
data[1]
.replace(
"Kota:",
""
)
.trim()



let username=
data[2]
.replace(
"Username:",
""
)
.trim()



db.members.push({

id:register.member_id,

nama:nama,

nomor:sender,

kota:kota,

username:username,

status:"pending",

tanggal_daftar:
new Date().toISOString()

})



db.registrations=
db.registrations.filter(
(x)=>x.phone!==sender
)



saveDB(db)



await sock.sendMessage(
chat,
{
text:
`
✅ DATA BERHASIL DIKIRIM

ID:
${register.member_id}

Nama:
${nama}

Status:
Pending

Menunggu approval admin.
`
}
)

}



// ================= APPROVE MEMBER =================


if(
text.startsWith("/approve")
){

if(
!config.OWNER.includes(sender)
){

await sock.sendMessage(
chat,
{
text:
`
❌ Perintah khusus admin.
`
}
)

return

}



let id=
text
.split(" ")[1]
.toUpperCase()



let member=
db.members.find(
(x)=>x.id===id
)



if(!member){

await sock.sendMessage(
chat,
{
text:
`
❌ Member tidak ditemukan.
`
}
)

return

}



member.status="active"



let memberID=
db.member_ids.find(
(x)=>x.id===id
)


if(memberID){

memberID.status="used"

memberID.used_by=
member.nama

}



saveDB(db)



await sock.sendMessage(
chat,
{
text:
`
✅ MEMBER AKTIF

ID:
${id}

Nama:
${member.nama}

Status:
Active
`
}
)

}
  // ================= CEK STOCK =================


if(
text.startsWith("stock ")
){

let produk=
text
.replace("stock ","")
.trim()



let item=
db.stock.find(
(x)=>
x.nama.toLowerCase()
===
produk
)



if(!item){

await sock.sendMessage(
chat,
{
text:
`
❌ Produk tidak ditemukan.

Silakan cek nama produk.
`
}
)

return

}



await sock.sendMessage(
chat,
{
text:
`
📦 STOCK PRODUK

Produk:
${item.nama}

Status:
${item.status}

Jumlah:
${item.jumlah}

Silakan tunggu konfirmasi admin.
`
}
)

}



// ================= ADMIN READY =================


if(
text.startsWith("/ready")
){

if(
!config.ADMIN.includes(sender)
){

await sock.sendMessage(
chat,
{
text:
`
❌ Khusus admin.
`
}
)

return

}



let produk=
text
.replace("/ready ","")
.trim()



await sock.sendMessage(
chat,
{
text:
`
✅ STOCK READY

Produk:
${produk}

Silakan kirim format order.
`
}
)

}



// ================= BUAT ORDER =================


if(
text.includes("produk:")
&&
text.includes("paket:")
&&
text.includes("nama:")
){

let data=
msg.message.conversation
.split("\n")



let produk=
data[0]
.replace(
"Produk:",
""
)
.trim()



let paket=
data[1]
.replace(
" Paket:",
""
)
.replace(
"Paket:",
""
)
.trim()



let nama=
data[2]
.replace(
"Nama:",
""
)
.trim()



let orderID=
generateOrderID()



db.orders.push({

order_id:orderID,

customer:nama,

produk:produk,

paket:paket,

status:"pending",

tanggal:
new Date().toISOString()

})



saveDB(db)



await sock.sendMessage(
chat,
{
text:
`
📦 ORDER DITERIMA

ID Order:
${orderID}

Produk:
${produk}

Paket:
${paket}

Nama:
${nama}


Status:
Menunggu proses admin.
`
}
)

}
  // ================= INPUT PENJUALAN MEMBER =================


if(
text.startsWith("/jual")
){

let member=
db.members.find(
(x)=>
x.nomor===sender
)



if(!member){

await sock.sendMessage(
chat,
{
text:
`
❌ Data member tidak ditemukan.

Silakan daftar terlebih dahulu.
`
}
)

return

}



if(member.status!=="active"){

await sock.sendMessage(
chat,
{
text:
`
❌ Member belum aktif.

Tunggu approval admin.
`
}
)

return

}



await sock.sendMessage(
chat,
{
text:
`
📊 INPUT PENJUALAN

Format:

Produk:
Jumlah:
Nominal:

Kirim data penjualan.
`
}
)

}



// ================= SIMPAN PENJUALAN =================


if(
text.includes("produk:")
&&
text.includes("nominal:")
&&
text.includes("jumlah:")
){

let member=
db.members.find(
(x)=>
x.nomor===sender
)



if(!member)
return



let data=
msg.message.conversation
.split("\n")



let produk=
data[0]
.replace(
"Produk:",
""
)
.trim()



let jumlah=
data[1]
.replace(
"Jumlah:",
""
)
.trim()



let nominal=
data[2]
.replace(
"Nominal:",
""
)
.replace(
/[^0-9]/g,
""
)



db.sales.push({

member_id:member.id,

nama:member.nama,

produk:produk,

jumlah:Number(jumlah),

nominal:Number(nominal),

tanggal:
new Date().toISOString()

})



saveDB(db)



await sock.sendMessage(
chat,
{
text:
`
✅ PENJUALAN TERSIMPAN

Member:
${member.nama}

Produk:
${produk}

Nominal:
Rp${nominal}

Masuk rekap bulanan.
`
}
)

}



// ================= REKAP BULANAN =================


if(text==="/rekap"){

let member=
db.members.find(
(x)=>
x.nomor===sender
)



if(!member)
return



let bulan=
new Date()
.getMonth()



let tahun=
new Date()
.getFullYear()



let total=
db.sales
.filter(
(x)=>
x.member_id===member.id
&&
new Date(x.tanggal)
.getMonth()===bulan
&&
new Date(x.tanggal)
.getFullYear()===tahun
)
.reduce(
(a,b)=>
a+b.nominal,
0
)



await sock.sendMessage(
chat,
{
text:
`
📊 REKAP PENJUALAN BULAN INI

Member:
${member.nama}

Total:
Rp${total.toLocaleString("id-ID")}
`
}
)

}



// ================= RANKING TOP 3 =================


if(text==="/ranking"){

let ranking={}



db.sales.forEach(
(x)=>{

if(!ranking[x.member_id]){

ranking[x.member_id]={
nama:x.nama,
total:0
}

}


ranking[x.member_id].total
+=x.nominal


}

)



let hasil=
Object.values(ranking)
.sort(
(a,b)=>
b.total-a.total
)
.slice(0,3)



let pesan=
`
🏆 TOP 3 PENJUALAN BULAN INI

`



hasil.forEach(
(x,i)=>{

pesan+=
`
${i+1}. ${x.nama}
Rp${x.total.toLocaleString("id-ID")}

`

})



await sock.sendMessage(
chat,
{
text:pesan
}
)

}
  // ================= TARGET PENJUALAN =================


function checkTarget(total){


if(total>=150000){

return "🏆 GOLD TARGET\nMencapai Rp150.000"

}


if(total>=125000){

return "🥈 SILVER TARGET\nMencapai Rp125.000"

}


if(total>=100000){

return "🥉 BRONZE TARGET\nMencapai Rp100.000"

}


return "Belum mencapai target"

}



// ================= CEK TARGET MEMBER =================


if(text==="/target"){

let member=
db.members.find(
(x)=>
x.nomor===sender
)



if(!member)
return



let bulan=
new Date()
.getMonth()



let tahun=
new Date()
.getFullYear()



let total=
db.sales
.filter(
(x)=>
x.member_id===member.id
&&
new Date(x.tanggal)
.getMonth()===bulan
&&
new Date(x.tanggal)
.getFullYear()===tahun
)
.reduce(
(a,b)=>
a+b.nominal,
0
)



await sock.sendMessage(
chat,
{
text:
`
🎯 TARGET BULANAN

Member:
${member.nama}

Total:
Rp${total.toLocaleString("id-ID")}

Status:

${checkTarget(total)}
`
}
)

}



// ================= DATA EXPIRED =================


if(text.startsWith("/expired")){


if(!config.ADMIN.includes(sender))
return



let data=
text
.replace("/expired ","")
.split("|")



let customer=data[0]

let produk=data[1]

let tanggal=data[2]



db.subscriptions.push({

customer:customer,

produk:produk,

expired:tanggal,

status:"active"

})


saveDB(db)



await sock.sendMessage(
chat,
{
text:
`
✅ DATA EXPIRED TERSIMPAN

Customer:
${customer}

Produk:
${produk}

Expired:
${tanggal}
`
}
)

}



// ================= CEK EXPIRED =================


function checkExpired(){

let now=
new Date()



db.subscriptions.forEach(
async(sub)=>{


let expired=
new Date(sub.expired)



let diff=
expired-now



let hari=
Math.ceil(
diff/(1000*60*60*24)
)



if(
hari<=3 &&
hari>0
){

console.log(
`
Reminder:
${sub.customer}
${sub.produk}
sisa ${hari} hari
`
)

}



if(hari<=0){

sub.status="expired"

}


}
)


saveDB(db)

}



// cek setiap hari

setInterval(
checkExpired,
24*60*60*1000
)




// ================= BROADCAST ADMIN =================


if(text.startsWith("/broadcast")){


if(!config.OWNER.includes(sender))
return



let pesan=
text.replace(
"/broadcast ",
""
)



await sock.sendMessage(
chat,
{
text:
`
📢 BROADCAST NZstore

${pesan}
`
}
)

}



// ================= CLOSE MESSAGE =================


})


}



startBot()
