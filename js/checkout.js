// ===============================
// CHECKOUT BOOKSPACE
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const formCheckout = document.getElementById("formCheckout");

    if (!formCheckout) return;

    const pilihBuku = document.getElementById("pilihBuku");
    const gambarBuku = document.getElementById("gambarBuku");
    const infoBuku = document.getElementById("infoBuku");

    const jumlah = document.getElementById("jumlah");
    const hasilPesanan = document.getElementById("hasilPesanan");

    let bukuTerpilih = null;

    // Format Rupiah
    function formatRupiah(angka) {
        return "Rp " + Number(angka).toLocaleString("id-ID");
    }

    // Memuat katalog buku
    function tampilkanKatalog() {

        if (typeof dataKatalogBuku === "undefined") {
            alert("Data katalog buku tidak ditemukan.");
            return;
        }

        dataKatalogBuku.forEach(function (buku, index) {

            const option = document.createElement("option");

            option.value = index;
            option.textContent = buku.namaBarang;

            pilihBuku.appendChild(option);

        });

    }

    tampilkanKatalog();

    // Menampilkan cover buku
    pilihBuku.addEventListener("change", function () {

        const index = this.value;

        if (index === "") {

            bukuTerpilih = null;

            gambarBuku.style.display = "none";

            infoBuku.innerHTML = `
                <h3>Belum Ada Buku Dipilih</h3>
                <p>Silakan pilih buku untuk melihat detailnya.</p>
            `;

            return;
        }

        bukuTerpilih = dataKatalogBuku[index];

        gambarBuku.src = bukuTerpilih.cover;
        gambarBuku.style.display = "block";

        gambarBuku.onerror = function () {
            this.style.display = "none";
            infoBuku.innerHTML += `
                <p style="color:red;">Cover buku tidak ditemukan.</p>
            `;
        };

        infoBuku.innerHTML = `
            <h3>${bukuTerpilih.namaBarang}</h3>
            <p>Kode: ${bukuTerpilih.kodeBarang}</p>
            <p>Jenis: ${bukuTerpilih.jenisBarang}</p>
            <p>Edisi: ${bukuTerpilih.edisi}</p>
            <p>Stok: ${bukuTerpilih.stok}</p>
            <p>Harga: ${formatRupiah(bukuTerpilih.harga)}</p>
        `;

    });

    // Membuat pesanan
    formCheckout.addEventListener("submit", function (e) {

        e.preventDefault();

        const nama = document.getElementById("nama").value;
        const telepon = document.getElementById("telepon").value;
        const alamat = document.getElementById("alamat").value;
        const pembayaran = document.getElementById("pembayaran").value;

        const jumlahBuku = Number(jumlah.value);

        if (!bukuTerpilih) {
            alert("Silakan pilih buku terlebih dahulu!");
            return;
        }

        if (jumlahBuku < 1 || !Number.isInteger(jumlahBuku)) {
            alert("Jumlah buku tidak valid!");
            return;
        }

        if (jumlahBuku > bukuTerpilih.stok) {
            alert("Stok buku tidak mencukupi!");
            return;
        }

        const total = bukuTerpilih.harga * jumlahBuku;

        const pesanan = {

            id: "ORD" + Date.now(),

            nama: nama,
            telepon: telepon,
            alamat: alamat,

            kodeBarang: bukuTerpilih.kodeBarang,
            namaBarang: bukuTerpilih.namaBarang,
            cover: bukuTerpilih.cover,

            jumlah: jumlahBuku,
            harga: bukuTerpilih.harga,
            total: total,

            pembayaran: pembayaran,

            status: "Menunggu Pembayaran",

            tanggal: new Date().toLocaleString("id-ID")

        };

        // Simpan pesanan
        let daftarPesanan = JSON.parse(
            localStorage.getItem("dataPesanan")
        ) || [];

        daftarPesanan.push(pesanan);

        localStorage.setItem(
            "dataPesanan",
            JSON.stringify(daftarPesanan)
        );

        // Tampilkan hasil pesanan
        hasilPesanan.innerHTML = `

            <h3>Pesanan Berhasil Dibuat!</h3>

            <div class="detail-item">
                <span>ID Pesanan</span>
                <strong>${pesanan.id}</strong>
            </div>

            <div class="detail-item">
                <span>Nama</span>
                <strong>${pesanan.nama}</strong>
            </div>

            <div class="detail-item">
                <span>Buku</span>
                <strong>${pesanan.namaBarang}</strong>
            </div>

            <div class="detail-item">
                <span>Jumlah</span>
                <strong>${pesanan.jumlah} Buku</strong>
            </div>

            <div class="detail-item">
                <span>Harga Satuan</span>
                <strong>${formatRupiah(pesanan.harga)}</strong>
            </div>

            <div class="detail-item">
                <span>Pembayaran</span>
                <strong>${pesanan.pembayaran}</strong>
            </div>

            <div class="total-harga">
                <span>Total</span>
                <span>${formatRupiah(pesanan.total)}</span>
            </div>

            <span class="status-pesanan">
                ${pesanan.status}
            </span>

        `;

        alert("Pesanan berhasil dibuat!");

        formCheckout.reset();

        bukuTerpilih = null;

        gambarBuku.style.display = "none";

        infoBuku.innerHTML = `
            <h3>Belum Ada Buku Dipilih</h3>
            <p>Silakan pilih buku untuk melihat detailnya.</p>
        `;

    });

});