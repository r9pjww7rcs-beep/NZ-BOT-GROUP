# NZ-BOT-GROUP
WhatsApp Group Bot Automation NZstore
# 📝 Sistem Registrasi Member NZstore

## 1. Registrasi Member

Alur registrasi:

1. Member mengetik `/daftar`.
2. Bot meminta ID Member.
3. Member memasukkan ID yang diberikan Admin.
4. Bot mengecek ketersediaan ID.
5. Jika ID tersedia, member mengisi data diri.
6. Data disimpan ke database.
7. Status member menjadi Pending.
8. Admin melakukan approval.
9. Member aktif dapat menggunakan fitur NZstore.

---

## 2. Sistem ID Member

Setiap member memiliki ID unik yang dibuat oleh Admin.

Fungsi ID:
- Sebagai identitas reseller.
- Mencegah akun ganda.
- Menghubungkan data member dengan transaksi.
- Digunakan untuk rekap penjualan dan ranking.

Data ID:
- ID Member
- Status ID
- Pemilik ID
- Tanggal penggunaan

Status ID:
- Available
- Used

---

## 3. Data Member

Data yang disimpan:

- ID Member
- Nama
- Nomor WhatsApp
- Kota
- Username
- Status Member
- Tanggal daftar
- Riwayat transaksi

---

## 4. Status Member

### Pending
Member sudah melakukan registrasi dan menunggu persetujuan Admin.

### Active
Member sudah disetujui dan dapat menggunakan fitur reseller.

### Suspended
Akses member dibatasi sementara.

### Banned
Member tidak dapat menggunakan sistem.

---

## 5. Approval Admin

Admin dapat:

- Melihat member baru.
- Memeriksa data member.
- Mengaktifkan member.
- Menonaktifkan member.

Ketika disetujui:
- Status berubah menjadi Active.
- ID Member menjadi Used.
- Member dapat melakukan transaksi.

---

## 6. Hak Akses Member Aktif

Member dapat menggunakan:

- Melihat katalog produk.
- Melihat harga.
- Mengecek ketersediaan produk.
- Membuat order.
- Input data penjualan.
- Melihat rekap penjualan.
- Melihat ranking bulanan.

---

## 7. Pembatasan Sistem

- Member wajib memiliki ID valid.
- ID hanya dapat digunakan satu kali.
- Member Pending belum dapat melakukan transaksi.
- Semua transaksi terhubung dengan ID Member.
- Data aktivitas tersimpan otomatis.

---

## 8. Struktur Database Member

```json
{
  "id_member": "",
  "nama": "",
  "nomor": "",
  "kota": "",
  "username": "",
  "status": "pending",
  "tanggal_daftar": ""
}
