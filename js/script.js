// ============================================
// BOOKSPACE - SISTEM UTAMA
// ============================================


// ---------- LOCAL STORAGE ----------

function ambilData(key, dataAwal) {
    const data = localStorage.getItem(key);

    if (data === null) {
        localStorage.setItem(key, JSON.stringify(dataAwal));
        return JSON.parse(JSON.stringify(dataAwal));
    }

    return JSON.parse(data);
}

function simpanData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function rupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

function buatNomorDO() {
    return "DO" + Date.now().toString().slice(-8);
}


// ---------- DATA AWAL ----------

let pengguna = ambilData("bs_pengguna", dataPengguna);
let katalog = ambilData("bs_katalog", dataKatalogBuku);
let pesanan = ambilData("bs_pesanan", []);
let transaksi = ambilData("bs_transaksi", []);


// ---------- USER LOGIN ----------

function userAktif() {
    return JSON.parse(localStorage.getItem("bs_user_login"));
}

function adminAktif() {
    const user = userAktif();
    return user && user.role === "Admin";
}

function wajibLogin() {
    const halaman = document.body.dataset.page;

    if (halaman !== "login" && !userAktif()) {
        window.location.href = "login.html";
    }
}

function wajibAdmin() {
    if (!adminAktif()) {
        alert("Fitur ini hanya dapat digunakan oleh Admin.");
        window.location.href = "dashboard.html";
        return false;
    }

    return true;
}


// ---------- LOGOUT ----------

function logout() {
    if (confirm("Apakah kamu yakin ingin logout?")) {
        localStorage.removeItem("bs_user_login");
        window.location.href = "login.html";
    }
}


// ---------- NAVIGASI ----------

function pasangNavigasi() {
    document.querySelectorAll(".logout").forEach(function(link) {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            logout();
        });
    });

    const user = userAktif();

    document.querySelectorAll(".nama-user").forEach(function(element) {
        if (user) {
            element.textContent = user.nama + " (" + user.role + ")";
        }
    });

    document.querySelectorAll(".menu-admin").forEach(function(element) {
        element.style.display = adminAktif() ? "" : "none";
    });
}


// ---------- MODAL ----------

function bukaModal(id) {
    document.getElementById(id).style.display = "flex";
}

function tutupModal(id) {
    document.getElementById(id).style.display = "none";
}


// ============================================
// LOGIN, REGISTER, RESET PASSWORD
// ============================================

function prosesLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const user = pengguna.find(function(item) {
        return item.email.toLowerCase() === email.toLowerCase()
            && item.password === password;
    });

    if (!user) {
        alert("email/password yang anda masukkan salah");
        return;
    }

    localStorage.setItem("bs_user_login", JSON.stringify(user));

    alert("Login berhasil. Selamat datang " + user.nama + "!");

    window.location.href = "dashboard.html";
}


function prosesDaftar(event) {
    event.preventDefault();

    const nama = document.getElementById("daftarNama").value.trim();
    const email = document.getElementById("daftarEmail").value.trim();
    const password = document.getElementById("daftarPassword").value;
    const konfirmasi = document.getElementById("daftarKonfirmasi").value;

    if (nama.length < 3) {
        alert("Nama minimal 3 karakter.");
        return;
    }

    if (password.length < 6) {
        alert("Password minimal 6 karakter.");
        return;
    }

    if (password !== konfirmasi) {
        alert("Konfirmasi password tidak sama.");
        return;
    }

    const sudahAda = pengguna.some(function(item) {
        return item.email.toLowerCase() === email.toLowerCase();
    });

    if (sudahAda) {
        alert("Email sudah terdaftar.");
        return;
    }

    const akunBaru = {
        id: Date.now(),
        nama: nama,
        email: email,
        password: password,
        role: "User"
    };

    pengguna.push(akunBaru);
    simpanData("bs_pengguna", pengguna);

    alert("Pendaftaran berhasil. Silakan login.");

    tutupModal("modalDaftar");
    document.getElementById("formDaftar").reset();
}


function prosesResetPassword(event) {
    event.preventDefault();

    const email = document.getElementById("resetEmail").value.trim();
    const passwordBaru = document.getElementById("resetPassword").value;
    const konfirmasi = document.getElementById("resetKonfirmasi").value;

    const user = pengguna.find(function(item) {
        return item.email.toLowerCase() === email.toLowerCase();
    });

    if (!user) {
        alert("Email tidak ditemukan.");
        return;
    }

    if (passwordBaru.length < 6) {
        alert("Password minimal 6 karakter.");
        return;
    }

    if (passwordBaru !== konfirmasi) {
        alert("Konfirmasi password tidak sama.");
        return;
    }

    user.password = passwordBaru;

    simpanData("bs_pengguna", pengguna);

    alert("Password berhasil diubah. Silakan login kembali.");

    tutupModal("modalReset");
    document.getElementById("formReset").reset();
}


// ============================================
// DASHBOARD
// ============================================

function tampilkanDashboard() {
    const user = userAktif();

    let jam = new Date().getHours();
    let sapaan = "Selamat Malam";

    if (jam >= 4 && jam < 11) {
        sapaan = "Selamat Pagi";
    } else if (jam >= 11 && jam < 15) {
        sapaan = "Selamat Siang";
    } else if (jam >= 15 && jam < 18) {
        sapaan = "Selamat Sore";
    }

    document.getElementById("sapaan").textContent =
        sapaan + ", " + user.nama + "!";

    document.getElementById("jumlahBuku").textContent =
        katalog.length;

    document.getElementById("jumlahPesanan").textContent =
        pesanan.length;

    document.getElementById("jumlahTransaksi").textContent =
        transaksi.length;
}


// ============================================
// KATALOG: TAMPIL, TAMBAH, EDIT, HAPUS
// ============================================

function tampilkanKatalog() {
    const tabel = document.getElementById("tabelBuku");

    if (!tabel) return;

    tabel.innerHTML = "";

    katalog.forEach(function(buku, index) {

        let tombolAdmin = "";

        if (adminAktif()) {
            tombolAdmin = `
                <button onclick="editBuku('${escapeHTML(buku.kodeBarang)}')">
                    Edit
                </button>

                <button class="btn-danger"
                    onclick="hapusBuku('${escapeHTML(buku.kodeBarang)}')">
                    Hapus
                </button>
            `;
        }

        tabel.innerHTML += `
            <tr>
                <td>${index + 1}</td>

                <td>
                    <img src="${escapeHTML(buku.cover)}"
                         alt="${escapeHTML(buku.namaBarang)}"
                         onerror="this.style.display='none'">
                </td>

                <td>${escapeHTML(buku.kodeBarang)}</td>
                <td>${escapeHTML(buku.namaBarang)}</td>
                <td>${escapeHTML(buku.jenisBarang)}</td>
                <td>${escapeHTML(buku.edisi)}</td>
                <td>${rupiah(buku.harga)}</td>
                <td>${buku.stok}</td>

                <td>${tombolAdmin}</td>
            </tr>
        `;
    });
}


function tambahBuku(event) {
    event.preventDefault();

    if (!wajibAdmin()) return;

    const kode = document.getElementById("kode").value.trim();
    const nama = document.getElementById("namaBuku").value.trim();
    const jenis = document.getElementById("jenis").value.trim();
    const edisi = document.getElementById("edisi").value.trim();
    const harga = Number(document.getElementById("harga").value);
    const stok = Number(document.getElementById("stok").value);

    if (!kode || !nama || !jenis || !edisi || harga <= 0 || stok < 0) {
        alert("Mohon lengkapi data dengan benar.");
        return;
    }

    if (katalog.some(item => item.kodeBarang === kode)) {
        alert("Kode buku sudah digunakan.");
        return;
    }

    katalog.push({
        kodeBarang: kode,
        namaBarang: nama,
        jenisBarang: jenis,
        edisi: edisi,
        harga: harga,
        stok: stok,
        cover: "img/kepemimpinan.jpg"
    });

    simpanData("bs_katalog", katalog);

    tampilkanKatalog();

    event.target.reset();

    alert("Buku berhasil ditambahkan.");
}


function editBuku(kode) {
    if (!wajibAdmin()) return;

    const buku = katalog.find(item => item.kodeBarang === kode);

    if (!buku) return;

    document.getElementById("editKodeLama").value = buku.kodeBarang;
    document.getElementById("editNama").value = buku.namaBarang;
    document.getElementById("editJenis").value = buku.jenisBarang;
    document.getElementById("editEdisi").value = buku.edisi;
    document.getElementById("editHarga").value = buku.harga;
    document.getElementById("editStok").value = buku.stok;
    bukaModal("modalEdit");
}


function simpanEditBuku(event) {
    event.preventDefault();

    if (!wajibAdmin()) return;

    const kodeLama = document.getElementById("editKodeLama").value;

    const buku = katalog.find(item => item.kodeBarang === kodeLama);

    if (!buku) return;

    buku.namaBarang = document.getElementById("editNama").value.trim();
    buku.jenisBarang = document.getElementById("editJenis").value.trim();
    buku.edisi = document.getElementById("editEdisi").value.trim();
    buku.harga = Number(document.getElementById("editHarga").value);
    buku.stok = Number(document.getElementById("editStok").value);

    if (!buku.namaBarang || buku.harga <= 0 || buku.stok < 0) {
        alert("Data tidak valid.");
        return;
    }

    simpanData("bs_katalog", katalog);

    tampilkanKatalog();

    tutupModal("modalEdit");

    alert("Data buku berhasil diperbarui.");
}


function hapusBuku(kode) {
    if (!wajibAdmin()) return;

    if (!confirm("Yakin ingin menghapus buku ini?")) return;

    katalog = katalog.filter(item => item.kodeBarang !== kode);

    simpanData("bs_katalog", katalog);

    tampilkanKatalog();

    alert("Buku berhasil dihapus.");
}


// ============================================
// CHECKOUT
// ============================================

function isiPilihanBuku() {
    const pilihan = document.getElementById("pilihBuku");

    if (!pilihan) return;

    pilihan.innerHTML = '<option value="">Pilih buku</option>';

    katalog.forEach(function(buku) {
        pilihan.innerHTML += `
            <option value="${escapeHTML(buku.kodeBarang)}">
                ${escapeHTML(buku.namaBarang)} - ${rupiah(buku.harga)}
                (Stok: ${buku.stok})
            </option>
        `;
    });
}


function buatPesanan(event) {
    event.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const telepon = document.getElementById("telepon").value.trim();
    const alamat = document.getElementById("alamat").value.trim();
    const kode = document.getElementById("pilihBuku").value;
    const jumlah = Number(document.getElementById("jumlah").value);
    const pembayaran = document.getElementById("pembayaran").value;

    const buku = katalog.find(item => item.kodeBarang === kode);

    if (!nama || !telepon || !alamat || !buku || !pembayaran || jumlah < 1) {
        alert("Mohon lengkapi semua data pesanan.");
        return;
    }

    if (!Number.isInteger(jumlah)) {
        alert("Jumlah buku harus berupa bilangan bulat.");
        return;
    }

    if (jumlah > buku.stok) {
        alert("Stok buku tidak mencukupi.");
        return;
    }

    const total = buku.harga * jumlah;
    const nomorDO = buatNomorDO();

    buku.stok -= jumlah;

    const pesananBaru = {
        nomorDO: nomorDO,
        nama: nama,
        telepon: telepon,
        alamat: alamat,
        kodeBarang: buku.kodeBarang,
        judulBuku: buku.namaBarang,
        jumlah: jumlah,
        total: total,
        pembayaran: pembayaran,
        status: "Pesanan Diterima",
        ekspedisi: "JNE",
        tanggalKirim: new Date().toLocaleDateString("id-ID"),
        paket: "Reguler",
        tanggal: new Date().toLocaleString("id-ID"),
        perjalanan: [
            {
                waktu: new Date().toLocaleString("id-ID"),
                keterangan: "Pesanan berhasil diterima oleh BOOKSPACE."
            }
        ]
    };

    pesanan.push(pesananBaru);
    transaksi.push({...pesananBaru});

    simpanData("bs_katalog", katalog);
    simpanData("bs_pesanan", pesanan);
    simpanData("bs_transaksi", transaksi);

    document.getElementById("hasilPesanan").innerHTML = `
        <h2>Pesanan Berhasil!</h2>

        <p>Nomor DO: <b>${escapeHTML(nomorDO)}</b></p>
        <p>Nama: ${escapeHTML(nama)}</p>
        <p>Buku: ${escapeHTML(buku.namaBarang)}</p>
        <p>Jumlah: ${jumlah}</p>
        <p>Total: ${rupiah(total)}</p>
        <p>Pembayaran: ${escapeHTML(pembayaran)}</p>
        <p>Status: Pesanan Diterima</p>

        <p><b>Simpan nomor DO untuk melacak pesanan.</b></p>
    `;

    event.target.reset();

    isiPilihanBuku();

    alert("Pesanan berhasil dibuat!");
}


// ============================================
// TRACKING
// ============================================

function cariTracking(event) {
    event.preventDefault();

    const nomor = document.getElementById("nomorDO").value.trim();

    const hasil = document.getElementById("hasilTracking");

    const pesananBaru = pesanan.find(item => item.nomorDO === nomor);

    if (pesananBaru) {
        tampilkanDetailPesanan(pesananBaru, hasil);
        return;
    }

    const data = dataTracking[nomor];

    if (!data) {
        hasil.innerHTML = `
            <div class="empty">
                Nomor DO tidak ditemukan.
            </div>
        `;
        return;
    }

    let perjalanan = "";

    data.perjalanan.forEach(function(item) {
        perjalanan += `
            <div class="timeline-item">
                <b>${escapeHTML(item.waktu)}</b>
                <p>${escapeHTML(item.keterangan)}</p>
            </div>
        `;
    });

    hasil.innerHTML = `
        <h2>Informasi Pengiriman</h2>

        <p>Nomor DO: ${escapeHTML(data.nomorDO)}</p>
        <p>Nama: ${escapeHTML(data.nama)}</p>
        <p>Status: <span class="status">${escapeHTML(data.status)}</span></p>
        <p>Ekspedisi: ${escapeHTML(data.ekspedisi)}</p>
        <p>Tanggal Kirim: ${escapeHTML(data.tanggalKirim)}</p>
        <p>Jenis Paket: ${escapeHTML(data.paket)}</p>
        <p>Total Pembayaran: ${rupiah(data.total)}</p>

        <h3>Riwayat Perjalanan</h3>

        <div class="timeline">
            ${perjalanan}
        </div>
    `;
}


function tampilkanDetailPesanan(item, hasil) {
    let perjalanan = "";

    (item.perjalanan || []).forEach(function(data) {
        perjalanan += `
            <div class="timeline-item">
                <b>${escapeHTML(data.waktu)}</b>
                <p>${escapeHTML(data.keterangan)}</p>
            </div>
        `;
    });

    hasil.innerHTML = `
        <h2>Informasi Pengiriman</h2>

        <p>Nomor DO: ${escapeHTML(item.nomorDO)}</p>
        <p>Nama: ${escapeHTML(item.nama)}</p>
        <p>Alamat: ${escapeHTML(item.alamat)}</p>
        <p>Buku: ${escapeHTML(item.judulBuku)}</p>
        <p>Jumlah: ${item.jumlah}</p>
        <p>Ekspedisi: ${escapeHTML(item.ekspedisi)}</p>
        <p>Jenis Paket: ${escapeHTML(item.paket)}</p>
        <p>Total: ${rupiah(item.total)}</p>

        <p>Status:
            <span class="status">${escapeHTML(item.status)}</span>
        </p>

        <h3>Riwayat Perjalanan</h3>

        <div class="timeline">
            ${perjalanan}
        </div>
    `;
}


// ============================================
// LAPORAN DAN UBAH STATUS PESANAN
// ============================================

function tampilkanLaporan() {
    const tabel = document.getElementById("tabelLaporan");

    if (!tabel) return;

    tabel.innerHTML = "";

    pesanan.forEach(function(item, index) {

        let kontrolStatus = escapeHTML(item.status);

        if (adminAktif()) {
            kontrolStatus = `
                <select id="status-${index}">
                    ${daftarStatus.map(function(status) {
                        return `
                            <option value="${status}"
                                ${status === item.status ? "selected" : ""}>
                                ${status}
                            </option>
                        `;
                    }).join("")}
                </select>

                <button onclick="ubahStatus(${index})">
                    Simpan
                </button>
            `;
        }

        tabel.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHTML(item.nomorDO)}</td>
                <td>${escapeHTML(item.nama)}</td>
                <td>${escapeHTML(item.judulBuku)}</td>
                <td>${item.jumlah}</td>
                <td>${rupiah(item.total)}</td>
                <td>${kontrolStatus}</td>
            </tr>
        `;
    });

    if (pesanan.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Belum ada pesanan.
                </td>
            </tr>
        `;
    }
}


function ubahStatus(index) {
    if (!wajibAdmin()) return;

    const status = document.getElementById("status-" + index).value;

    pesanan[index].status = status;

    const catatan = {
        waktu: new Date().toLocaleString("id-ID"),
        keterangan: "Status pesanan diperbarui menjadi: " + status
    };

    pesanan[index].perjalanan.push(catatan);

    const transaksiTerkait = transaksi.find(function(item) {
        return item.nomorDO === pesanan[index].nomorDO;
    });

    if (transaksiTerkait) {
        transaksiTerkait.status = status;
        transaksiTerkait.perjalanan = pesanan[index].perjalanan;
    }

    simpanData("bs_pesanan", pesanan);
    simpanData("bs_transaksi", transaksi);

    tampilkanLaporan();

    alert("Status pesanan berhasil diperbarui.");
}


// ============================================
// RIWAYAT TRANSAKSI
// ============================================

function tampilkanHistory() {
    const tabel = document.getElementById("tabelHistory");

    if (!tabel) return;

    tabel.innerHTML = "";

    transaksi.forEach(function(item, index) {
        tabel.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHTML(item.nomorDO)}</td>
                <td>${escapeHTML(item.nama)}</td>
                <td>${escapeHTML(item.judulBuku)}</td>
                <td>${escapeHTML(item.tanggal || "-")}</td>
                <td>${rupiah(item.total)}</td>
                <td>${escapeHTML(item.pembayaran)}</td>
                <td>${escapeHTML(item.status)}</td>
            </tr>
        `;
    });

    if (transaksi.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    Belum ada transaksi.
                </td>
            </tr>
        `;
    }
}


// ============================================
// MENJALANKAN HALAMAN
// ============================================

document.addEventListener("DOMContentLoaded", function() {

    const halaman = document.body.dataset.page;

    if (halaman !== "login") {
        wajibLogin();

        if (!userAktif()) return;
    }

    pasangNavigasi();


    if (halaman === "login") {

        document.getElementById("formLogin")
            .addEventListener("submit", prosesLogin);

        document.getElementById("formDaftar")
            .addEventListener("submit", prosesDaftar);

        document.getElementById("formReset")
            .addEventListener("submit", prosesResetPassword);
    }


    if (halaman === "dashboard") {
        tampilkanDashboard();
    }


    if (halaman === "stok") {

        tampilkanKatalog();

        const formBuku = document.getElementById("formBuku");

        if (adminAktif()) {
            formBuku.addEventListener("submit", tambahBuku);
        } else {
            formBuku.style.display = "none";
            document.getElementById("infoUser").style.display = "block";
        }

        document.getElementById("formEditBuku")
            .addEventListener("submit", simpanEditBuku);
    }


    if (halaman === "checkout") {
        isiPilihanBuku();

        document.getElementById("formCheckout")
            .addEventListener("submit", buatPesanan);
    }


    if (halaman === "tracking") {
        document.getElementById("formTracking")
            .addEventListener("submit", cariTracking);
    }


    if (halaman === "laporan") {
        tampilkanLaporan();
    }


    if (halaman === "history") {
        tampilkanHistory();
    }

});