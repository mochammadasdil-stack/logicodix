window.LOGICODIX_MISSIONS = [
  {
    id: 'kantin',
    number: '01',
    title: 'Operasi kantin',
    category: 'ANGGARAN + STOK',
    summary: 'Rakit empat paket dari pilihan stok yang terbatas.',
    context: 'Tim berisi empat siswa perlu membawa satu makanan dan satu minuman per orang. Susun belanjaan yang memenuhi permintaan, stok kantin, dan batas kas sekaligus.',
    constraints: [
      'Anggaran maksimal Rp23.000 untuk 4 makanan + 4 minuman.',
      'Makanan: minimal 2 pisang, minimal 1 roti, minimal 1 risol, dan maksimal 2 risol.',
      'Stok: roti 2, risol 2, pisang 4; minuman: susu 2, air mineral 4.',
      'Harga: roti Rp5.000, risol Rp4.000, pisang Rp2.000, susu Rp4.000, air mineral Rp2.000.'
    ],
    question: 'Rencana belanja mana yang memenuhi semua syarat?',
    answerFormat: 'Pilih satu susunan belanja. Periksa jumlah, stok, dan totalnya.',
    choices: [
      { id: 'paket-a', label: '1 roti + 1 risol + 2 pisang; 1 susu + 3 air mineral', detail: 'Total Rp23.000 · 4 makanan dan 4 minuman', correct: true },
      { id: 'paket-b', label: '2 roti + 1 risol + 1 pisang; 1 susu + 3 air mineral', detail: 'Total Rp26.000 · melebihi batas kas', correct: false },
      { id: 'paket-c', label: '1 roti + 2 risol + 1 pisang; 1 susu + 3 air mineral', detail: 'Total Rp25.000 · pisang kurang dari 2', correct: false },
      { id: 'paket-d', label: '1 roti + 1 risol + 2 pisang; 2 susu + 2 air mineral', detail: 'Total Rp25.000 · melebihi batas kas', correct: false }
    ],
    hints: [
      'Pisahkan dulu masalahnya: susun 4 makanan yang cocok, lalu penuhi 4 minuman tanpa melewati stok.',
      'Minuman termurah yang tetap memenuhi 4 orang adalah 1 susu + 3 air mineral = Rp10.000. Sisa anggaran untuk makanan Rp13.000.',
      'Coba gabungkan 1 roti, 1 risol, dan 2 pisang. Jumlahnya tepat 4 makanan dengan biaya Rp13.000.'
    ],
    explanationCorrect: 'Rencana ini memenuhi jumlah 4 makanan dan 4 minuman. Makanannya mengandung sedikitnya 2 pisang, 1 roti, dan 1 risol; stok tidak terlampaui. Satu susu + tiga air mineral berharga Rp10.000, sementara makanan Rp13.000—tepat Rp23.000.',
    explanationWrong: 'Cocokkan satu per satu: empat porsi makanan, syarat minimal pisang/roti/risol, batas stok, dan total paling banyak Rp23.000. Belanja yang benar ialah 1 roti + 1 risol + 2 pisang, serta 1 susu + 3 air mineral. Totalnya tepat Rp23.000.'
  },
  {
    id: 'jadwal',
    number: '02',
    title: 'Slot ekskul yang pas',
    category: 'JADWAL SEKOLAH',
    summary: 'Temukan satu jam klub robotik tanpa bentrok.',
    context: 'Klub robotik perlu memakai ruang praktik selama 60 menit. Kamu juga punya jadwal piket perpustakaan dan basket. Pilih slot yang muat seluruh batas waktu.',
    constraints: [
      'Ruang praktik hanya tersedia Selasa dan Kamis, pukul 14.30–16.00.',
      'Piket perpustakaan: Selasa pukul 15.00–16.00.',
      'Latihan basket: Rabu pukul 14.00–15.30.',
      'Sesi robotik berlangsung 60 menit penuh dan tidak boleh melewati jam ruang tutup.'
    ],
    question: 'Slot 60 menit mana yang bisa dipakai untuk klub robotik?',
    answerFormat: 'Pilih satu hari dan jam yang cocok dengan semua jadwal.',
    choices: [
      { id: 'slot-a', label: 'Selasa, 14.00–15.00', detail: 'Mulai sebelum ruang praktik tersedia', correct: false },
      { id: 'slot-b', label: 'Selasa, 14.30–15.30', detail: 'Bertabrakan dengan piket perpustakaan', correct: false },
      { id: 'slot-c', label: 'Kamis, 14.30–15.30', detail: 'Ruang tersedia dan tidak ada jadwal bentrok', correct: true },
      { id: 'slot-d', label: 'Kamis, 15.30–16.30', detail: 'Sesi melewati jam ruang praktik tutup', correct: false }
    ],
    hints: [
      'Coret dulu hari yang ruang praktiknya tidak tersedia.',
      'Slot Selasa yang dimulai 14.30 tumpang tindih dengan piket mulai pukul 15.00.',
      'Di Kamis, hitung durasi 60 menit dan pastikan seluruh sesi berakhir paling lambat 16.00.'
    ],
    explanationCorrect: 'Kamis 14.30–15.30 berada di dalam jam ketersediaan ruang (14.30–16.00), tepat 60 menit, dan tidak bertabrakan dengan piket Selasa ataupun basket Rabu.',
    explanationWrong: 'Slot yang memenuhi semua batasan adalah Kamis, 14.30–15.30. Selasa 14.30–15.30 bertabrakan dengan piket; Rabu tidak tersedia ruang; dan Kamis 15.30–16.30 melewati jam tutup.'
  },
  {
    id: 'rute',
    number: '03',
    title: 'Kejar bus pulang',
    category: 'RUTE + WAKTU',
    summary: 'Pilih jalur yang tiba sebelum batas bus.',
    context: 'Kamu keluar sekolah pukul 15.35. Bus berangkat pukul 16.00 dan penumpang harus tiba setidaknya lima menit sebelum berangkat. Kecepatan jalan rata-rata 60 meter per menit.',
    constraints: [
      'Batas aman tiba di halte: pukul 15.55.',
      'Jalur pintas halaman: 600 m, tetapi gerbangnya tutup pukul 15.42.',
      'Jalan utama: 900 m dan lampu penyeberangan menambah 2 menit.',
      'Jalur jembatan: 650 m, tetapi jembatan baru dibuka pukul 15.45; hitung waktu menunggunya.'
    ],
    question: 'Jalur mana yang membawamu tiba dengan aman sebelum batas waktu?',
    answerFormat: 'Pilih jalur dengan mempertimbangkan lama jalan, waktu tunggu, dan gerbang.',
    choices: [
      { id: 'rute-a', label: 'Jalur pintas halaman, 600 m', detail: 'Perjalanan sekitar 10 menit, gerbang tutup 15.42', correct: false },
      { id: 'rute-b', label: 'Jalan utama, 900 m + lampu penyeberangan', detail: 'Sekitar 15 menit berjalan + 2 menit menunggu', correct: true },
      { id: 'rute-c', label: 'Jalur jembatan, 650 m', detail: 'Jembatan baru dibuka 15.45; perjalanan sekitar 11 menit', correct: false }
    ],
    hints: [
      'Dari 15.35 sampai batas aman 15.55 tersedia waktu 20 menit.',
      'Untuk jalan utama: ubah jarak 900 meter menjadi menit dengan kecepatan 60 meter per menit, lalu tambahkan 2 menit lampu.',
      'Bandingkan waktu tiba dengan 15.55. Jalur pintas juga punya gerbang yang tutup lebih awal, sedangkan jembatan memerlukan waktu tunggu.'
    ],
    explanationCorrect: 'Jalan utama memerlukan 900 ÷ 60 = 15 menit, ditambah 2 menit lampu penyeberangan. Berangkat 15.35 berarti tiba sekitar 15.52, tiga menit sebelum batas aman 15.55.',
    explanationWrong: 'Jalan utama adalah pilihan aman: 900 ÷ 60 = 15 menit berjalan, ditambah 2 menit menunggu, sehingga tiba sekitar 15.52. Jalur pintas terlambat melewati gerbang yang tutup 15.42; jembatan menunggu sampai 15.45 lalu perlu sekitar 11 menit berjalan, tiba sekitar 15.56.'
  }
];
