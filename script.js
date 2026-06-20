// --- 1. FUNGSI UNTUK HALAMAN PRODUK ---
function langsungBeli(namaRoti, hargaRoti, gambarRoti) {
    // Ambil daftar keranjang lama, jika belum ada buat daftar kosong []
    // Catatan: Saya mengubah nama kuncinya menjadi 'daftar_keranjang' agar memori lama tidak bentrok
    let keranjang = JSON.parse(localStorage.getItem('daftar_keranjang')) || [];

    // Cek apakah produk yang sama sudah ada di keranjang
    let indexProdukSama = keranjang.findIndex(item => item.nama === namaRoti);

    if (indexProdukSama !== -1) {
        // Jika rotinya sudah ada, cukup tambahkan jumlahnya (qty)
        keranjang[indexProdukSama].qty += 1;
    } else {
        // Jika roti belum ada, masukkan sebagai produk baru ke dalam daftar
        keranjang.push({
            nama: namaRoti,
            harga: hargaRoti,
            gambar: gambarRoti,
            qty: 1
        });
    }
    
    // Simpan kembali daftar belanja yang baru ke memori browser
    localStorage.setItem('daftar_keranjang', JSON.stringify(keranjang));
    
    // Pindah halaman ke keranjang
    window.location.href = "keranjang.html";
}


// --- 2. FUNGSI UNTUK HALAMAN KERANJANG ---
document.addEventListener("DOMContentLoaded", function () {
    renderKeranjang();
});

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

function renderKeranjang() {
    const tempatKeranjang = document.getElementById('tempat-keranjang');
    const ringkasanSubtotal = document.getElementById('ringkasan-subtotal');
    const ringkasanTotal = document.getElementById('ringkasan-total');
    const btnCheckoutWa = document.getElementById('btn-checkout-wa');

    if (!tempatKeranjang) return; 

    // Ambil data dari memori
    let keranjang = JSON.parse(localStorage.getItem('daftar_keranjang')) || [];

    // Jika keranjang benar-benar kosong
    if (keranjang.length === 0) {
        tempatKeranjang.innerHTML = `
            <div class="text-center p-4 bg-white border rounded mt-3 shadow-sm">
                <p class="text-muted mb-0">Keranjang Anda masih kosong.</p>
            </div>`;
        if(ringkasanSubtotal) ringkasanSubtotal.innerText = "Rp 0";
        if(ringkasanTotal) ringkasanTotal.innerText = "Rp 0";
        return;
    }

    let totalHargaSemua = 0;
    let htmlKeranjang = "";

    // Membangun tampilan (HTML) untuk SETIAP produk yang ada di daftar keranjang
    keranjang.forEach((item, index) => {
        let subtotalItem = item.harga * item.qty;
        totalHargaSemua += subtotalItem;

        htmlKeranjang += `
            <div class="d-flex align-items-center justify-content-between bg-white p-3 rounded shadow-sm border mb-3 mt-3">
                <div class="d-flex align-items-center" style="width: 40%;">
                    <div class="rounded me-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; background-color: #f3d5b5; overflow: hidden;">
                        <img src="${item.gambar}" alt="${item.nama}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <span class="fw-bold text-dark">${item.nama}</span>
                </div>
                
                <div style="width: 30%; text-align: center;">
                    <span class="text-muted fw-bold">${formatRupiah(item.harga)}</span>
                </div>
                
                <div class="d-flex align-items-center justify-content-end" style="width: 30%;">
                    <button class="btn btn-sm btn-outline-secondary me-2" onclick="kurangQty(${index})">-</button>
                    <span class="fw-bold mx-1">${item.qty}</span>
                    <button class="btn btn-sm btn-outline-secondary ms-2 me-3" onclick="tambahQty(${index})">+</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="hapusItem(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    // Masukkan seluruh produk ke halaman
    tempatKeranjang.innerHTML = htmlKeranjang;

    // Update ringkasan total harga
    if(ringkasanSubtotal) ringkasanSubtotal.innerText = formatRupiah(totalHargaSemua);
    if(ringkasanTotal) ringkasanTotal.innerText = formatRupiah(totalHargaSemua);

    // --- 3. FUNGSI TOMBOL LANJUT CHECKOUT ---
    if (btnCheckoutWa) {
        btnCheckoutWa.onclick = function() {
            window.location.href = "kontak.html";
        };
    }
}

// --- 4. FUNGSI TOMBOL PLUS, MINUS, DAN HAPUS ---
// Fungsi ini diletakkan di luar agar bisa dipanggil oleh masing-masing produk
function tambahQty(index) {
    let keranjang = JSON.parse(localStorage.getItem('daftar_keranjang'));
    keranjang[index].qty++;
    localStorage.setItem('daftar_keranjang', JSON.stringify(keranjang));
    renderKeranjang(); // Refresh tampilan
}

function kurangQty(index) {
    let keranjang = JSON.parse(localStorage.getItem('daftar_keranjang'));
    if (keranjang[index].qty > 1) {
        keranjang[index].qty--;
        localStorage.setItem('daftar_keranjang', JSON.stringify(keranjang));
        renderKeranjang(); // Refresh tampilan
    }
}

function hapusItem(index) {
    let keranjang = JSON.parse(localStorage.getItem('daftar_keranjang'));
    keranjang.splice(index, 1); // Hapus 1 produk berdasarkan urutannya
    localStorage.setItem('daftar_keranjang', JSON.stringify(keranjang));
    renderKeranjang(); // Refresh tampilan
}
// --- 1. AUTO-FILL DAFTAR PESANAN SAAT HALAMAN DIBUKA ---
document.addEventListener("DOMContentLoaded", function () {
    const tempatPesanan = document.getElementById('daftarPesanan');
    
    // Ambil data keranjang dari memori browser
    let keranjang = JSON.parse(localStorage.getItem('daftar_keranjang')) || [];
    
    // Jika tidak ada barang di keranjang
    if (keranjang.length === 0) {
        if (tempatPesanan) tempatPesanan.value = "Keranjang kosong. Belum ada pesanan.";
        return;
    }

    // Susun teks struk pesanan
    let teksPesanan = "Detail Pesanan:\n";
    let totalHargaSemua = 0;

    keranjang.forEach(item => {
        let subtotal = item.harga * item.qty;
        totalHargaSemua += subtotal;
        
        let hargaFormat = new Intl.NumberFormat('id-ID').format(item.harga);
        teksPesanan += `- ${item.qty}x ${item.nama} (@ Rp ${hargaFormat})\n`;
    });

    let totalFormat = new Intl.NumberFormat('id-ID').format(totalHargaSemua);
    teksPesanan += `\n*TOTAL HARGA: Rp ${totalFormat}*`;

    // Tampilkan di dalam kotak textarea
    if (tempatPesanan) {
        tempatPesanan.value = teksPesanan;
    }
});

// --- 2. FUNGSI KIRIM KE WHATSAPP ---
function kirimKeWhatsApp() {
    const nama = document.getElementById('namaLengkap').value;
    const nomor = document.getElementById('nomorWa').value;
    const alamat = document.getElementById('alamatKirim').value;
    const pesanan = document.getElementById('daftarPesanan').value;

    // Cek apakah ada yang belum diisi
    if (!nama || !nomor || !alamat) {
        alert("Mohon lengkapi Nama, Nomor WA, dan Alamat Anda terlebih dahulu!");
        return;
    }
    
    // Cek apakah keranjang masih kosong
    if (pesanan.includes("Keranjang kosong")) {
        alert("Keranjang Anda masih kosong, silakan pilih roti di halaman produk.");
        return;
    }

    // Format Wa admin
    const nomorAdmin = "6282237973942"; 

    // Susunan pesan yang akan terkirim ke WhatsApp
    const teksPesan = `Halo Admin Toko Roti, saya ingin checkout pesanan:\n\n` +
                      `*Data Pembeli:*\n` +
                      `- Nama: ${nama}\n` +
                      `- No WA: ${nomor}\n` +
                      `- Alamat: ${alamat}\n\n` +
                      `*${pesanan}*\n\n` +
                      `Mohon segera diproses ya, terima kasih!`;

    // Ubah pesan jadi format link
    const pesanEncoded = encodeURIComponent(teksPesan);

    // Buka WhatsApp
    const linkWhatsApp = `https://wa.me/${nomorAdmin}?text=${pesanEncoded}`;
    window.open(linkWhatsApp, '_blank');
}