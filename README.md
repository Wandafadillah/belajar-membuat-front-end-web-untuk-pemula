# Expense Tracker App — Submission

Personal Finance & Expense Tracker App yang dibangun dengan HTML, CSS, dan JavaScript murni (tanpa library eksternal).

## Struktur Berkas

```
expense-tracker-app/
├── index.html   ← Struktur halaman
├── style.css    ← Tampilan visual
├── main.js      ← Seluruh logika JavaScript
└── README.md    ← Berkas ini
```

## Sebelum Submit — WAJIB DICEK

Buka `index.html`, cari elemen dengan class `tracker-header__greeting`, lalu ganti teks
`Nama Anda (usernameanda)` dengan nama dan username Dicoding Anda sendiri.
Contoh: `Budi (bdi002)`.

## Cara Menjalankan

Proyek ini statis, tidak perlu instalasi apa pun.

- **Opsi 1 (disarankan):** buka `index.html` dengan ekstensi Live Server di VS Code.
- **Opsi 2:** buka langsung berkas `index.html` di browser.

## Fitur yang Diimplementasikan

**Kriteria 1 — Manipulasi DOM untuk Form dan Daftar Transaksi**
- Transaksi baru langsung tampil di `incomeList` atau `expenseList` sesuai tipenya.
- Validasi form: judul tidak boleh kosong, nominal minimal Rp1 (menampilkan `alert()`).
- Panel dashboard menampilkan total saldo, total pemasukan, dan total pengeluaran yang
  otomatis diperbarui setiap kali data berubah.

**Kriteria 2 — Web Storage API**
- Data transaksi disimpan ke `localStorage` dengan `JSON.stringify()` dan dimuat kembali
  dengan `JSON.parse()` saat halaman dibuka.
- Tombol **Hapus** menghapus transaksi dari layar sekaligus dari `localStorage`.
- Tombol **Edit** mengisi form (`#transactionForm`) dengan data transaksi terpilih;
  setelah disimpan, form kembali ke mode "Tambah Transaksi".
- Setiap perubahan data (tambah/hapus/edit/ubah tipe) memicu `CustomEvent` melalui
  `dispatchEvent()`, yang ditangkap oleh satu listener untuk memperbarui seluruh tampilan.

**Kriteria 3 — Fitur Interaktif**
- Tombol **Ubah Tipe** memindahkan transaksi antara daftar Pemasukan ↔ Pengeluaran.
- Kolom pencarian memfilter daftar transaksi secara langsung berdasarkan judul.
- Mengosongkan kolom pencarian akan menampilkan kembali seluruh daftar transaksi.

## Catatan Teknis

- Elemen kartu transaksi dibuat dengan `document.createElement()` (bukan `innerHTML +=`)
  agar event listener pada tombol tidak hilang saat render ulang.
- Setiap transaksi disimpan sebagai objek: `{ id, title, amount, date, type }`, dengan
  `amount` bertipe `Number` dan `type` bernilai `'income'` atau `'expense'`.
