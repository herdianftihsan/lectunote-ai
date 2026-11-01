// src/lib/mock-data.ts
// Data Mock Lengkap: Jaringan Komputer — Model OSI & TCP/IP
// Digunakan oleh Frontend Dev untuk slicing UI langsung tanpa menunggu Backend selesai

import {
  StudyKitContent,
  QuizEvaluationResult,
  StudyKitRecord,
  ProfileRecord,
  ActivityLogRecord,
} from "@/types/study-kit";

export const mockStudyKitContent: StudyKitContent = {
  study_kit_metadata: {
    course_name: "Jaringan Komputer",
    topic_title: "Model OSI & TCP/IP",
    summary_goal:
      "Tujuan: memahami alur komunikasi, memilih protokol transport, dan menghitung host IPv4 dasar.",
  },
  summary: {
    sections: [
      {
        section_number: "01",
        title: "Model OSI dan TCP/IP",
        paragraphs: [
          "Model OSI membagi komunikasi jaringan menjadi tujuh layer: Physical, Data Link, Network, Transport, Session, Presentation, dan Application. Pemisahan fungsi membantu analisis gangguan serta perancangan protokol.",
        ],
        bullet_points: [
          "Physical mengirim bit melalui media. Data Link menangani frame dan alamat MAC pada link lokal. Network meneruskan paket antarjaringan menggunakan alamat IP.",
          "TCP/IP umumnya memakai empat layer: Link, Internet, Transport, dan Application. Layer Internet sepadan dengan fungsi inti Network pada OSI.",
        ],
        page_reference: "hlm. 3–7",
      },
      {
        section_number: "02",
        title: "Enkapsulasi data",
        paragraphs: [
          "Saat dikirim, data aplikasi diberi header di setiap layer: data → segmen TCP atau datagram UDP → paket IP → frame → bit. Tiap header membawa informasi untuk fungsi layer tersebut.",
        ],
        bullet_points: [
          "Penerima melakukan dekapsulasi dalam urutan terbalik. Port mengidentifikasi layanan/proses, IP mengidentifikasi antarmuka jaringan, dan MAC digunakan pada link lokal.",
        ],
        page_reference: "hlm. 8–10",
      },
      {
        section_number: "03",
        title: "TCP dibanding UDP",
        paragraphs: [
          "TCP menyediakan aliran byte yang andal dan berurutan melalui nomor urut, acknowledgment, serta retransmisi. Cocok untuk transfer berkas dan layanan yang membutuhkan kelengkapan data.",
          "UDP mengirim datagram tanpa jaminan pengiriman atau urutan pada protokol transportnya. Overhead lebih kecil; aplikasi dapat memilihnya untuk komunikasi waktu nyata dan menangani kehilangan data sesuai kebutuhan.",
        ],
        bullet_points: [
          "HTTP adalah protokol aplikasi untuk pertukaran permintaan dan respons sumber daya web. HTTP/1.1 dan HTTP/2 umumnya menggunakan TCP; HTTP/3 menggunakan QUIC di atas UDP.",
        ],
        page_reference: "hlm. 11–15",
      },
      {
        section_number: "04",
        title: "IP dan routing",
        paragraphs: [
          "Alamat IP dipakai untuk pengalamatan logis. Router membaca alamat IP tujuan dan tabel routing untuk menentukan next hop. Routing merupakan fungsi layer Network pada OSI.",
        ],
        bullet_points: [
          "Switch Ethernet meneruskan frame berdasarkan alamat MAC tujuan dan tabel MAC pada layer Data Link. Switch tidak menggantikan fungsi routing antar-subnet.",
        ],
        page_reference: "hlm. 16–19",
      },
      {
        section_number: "05",
        title: "Subnet IPv4 /24",
        paragraphs: [
          "Prefiks /24 berarti 24 bit untuk bagian jaringan dan 8 bit untuk bagian host. Subnet mask-nya 255.255.255.0. Jumlah alamat adalah 2⁸ = 256.",
        ],
        bullet_points: [
          "Untuk subnet IPv4 /24 konvensional, alamat jaringan dan broadcast tidak digunakan sebagai alamat host: 256 − 2 = 254 host.",
          "Contoh 192.168.1.0/24: jaringan .0, host .1–.254, broadcast .255. Jangan menyamakan jumlah alamat total dengan host yang dapat digunakan.",
        ],
        page_reference: "hlm. 20–24",
      },
    ],
    core_concepts: [
      "MAC → link lokal",
      "IP → antarjaringan",
      "Port → layanan/proses",
      "/24 → 254 host",
    ],
  },
  flashcards: [
    {
      card_index: 1,
      question: "Apa fungsi utama dari Physical Layer pada model OSI?",
      question_hint: "Fokus pada bentuk transmisi fisik sinyal.",
      answer_heading: "Transmisi Bit Melalui Media Fisik.",
      answer_body:
        "Physical layer bertanggung jawab mengonversi data digital menjadi sinyal listrik, optik, atau gelombang radio untuk ditransmisikan melalui kabel atau udara.",
      page_reference: "hlm. 4–5",
    },
    {
      card_index: 2,
      question: "Apa perbedaan peran alamat MAC dan alamat IP?",
      question_hint: "Pikirkan lingkup komunikasi lokal vs antar-jaringan.",
      answer_heading: "MAC di Link Lokal, IP untuk Antarjaringan.",
      answer_body:
        "Alamat MAC digunakan switch pada layer 2 untuk mengirim frame dalam jaringan lokal. Alamat IP digunakan router pada layer 3 untuk mengarahkan paket melintasi router dan subnet berbeda.",
      page_reference: "hlm. 8–10",
    },
    {
      card_index: 3,
      question: "Layer OSI mana yang menangani routing paket antarjaringan?",
      question_hint:
        "Pikirkan fungsi pengalamatan logis sebelum membalik kartu.",
      answer_heading: "Layer Network (layer 3).",
      answer_body:
        "Router menggunakan alamat IP tujuan dan tabel routing untuk menentukan jalur atau next hop. Pada model TCP/IP, fungsi ini berada di layer Internet.",
      page_reference: "hlm. 16–19",
    },
    {
      card_index: 4,
      question:
        "Mengapa UDP lebih dipilih daripada TCP untuk komunikasi video waktu nyata?",
      question_hint:
        "Pertimbangkan toleransi latensi vs kehilangan beberapa paket.",
      answer_heading: "Overhead Kecil dan Tanpa Menunggu Retransmisi.",
      answer_body:
        "UDP tidak memiliki mekanisme handshake 3 arah dan retransmisi data hilang, sehingga menghasilkan latensi minimal yang sangat penting untuk panggilan video atau streaming audio real-time.",
      page_reference: "hlm. 12–14",
    },
    {
      card_index: 5,
      question:
        "Berapa jumlah host yang dapat digunakan pada subnet IPv4 /24?",
      question_hint: "Ingat ada 2 alamat yang direservasi.",
      answer_heading: "254 host.",
      answer_body:
        "Subnet /24 memiliki 8 bit host (2⁸ = 256). Alamat pertama adalah network ID (.0) dan alamat terakhir adalah broadcast (.255), sehingga yang dapat digunakan adalah 256 - 2 = 254 host.",
      page_reference: "hlm. 21–23",
    },
    {
      card_index: 6,
      question: "Apa unit data pada Layer Transport ketika menggunakan TCP?",
      question_hint: "Bukan paket atau frame.",
      answer_heading: "Segmen (Segment).",
      answer_body:
        "Data aplikasi yang diproses oleh TCP dipecah menjadi unit yang disebut segmen yang dilengkapi header TCP (termasuk port dan nomor urut).",
      page_reference: "hlm. 8–9",
    },
    {
      card_index: 7,
      question: "Apa fungsi dari protokol ARP (Address Resolution Protocol)?",
      question_hint: "Menghubungkan layer 3 ke layer 2.",
      answer_heading: "Menerjemahkan Alamat IP Menjadi Alamat MAC.",
      answer_body:
        "ARP digunakan oleh perangkat di jaringan lokal untuk menemukan alamat MAC fisik perangkat tujuan berdasarkan alamat IP yang diketahui.",
      page_reference: "hlm. 10–11",
    },
    {
      card_index: 8,
      question: "Apa tujuan utama dari 3-Way Handshake pada TCP?",
      question_hint: "SYN, SYN-ACK, ACK.",
      answer_heading: "Sinkronisasi Nomor Urut dan Pembentukan Koneksi Andal.",
      answer_body:
        "Handshake memastikan kedua sisi siap bertukar data dan menyepakati nomor urut awal sebelum pengiriman data aktual dimulai.",
      page_reference: "hlm. 13–14",
    },
    {
      card_index: 9,
      question: "Di layer manakah protokol DNS dan HTTP beroperasi?",
      question_hint: "Layer teratas model OSI.",
      answer_heading: "Layer Aplikasi (Application Layer).",
      answer_body:
        "DNS dan HTTP beroperasi pada Layer 7 (OSI) atau Layer Aplikasi (TCP/IP), berinteraksi langsung dengan aplikasi perangkat lunak pengguna.",
      page_reference: "hlm. 6–7",
    },
    {
      card_index: 10,
      question: "Apa perbedaan mendasar antara Hub dan Switch?",
      question_hint: "Penanganan collision domain dan alamat MAC.",
      answer_heading: "Switch Cerdas Membaca MAC; Hub Melakukan Broadcast.",
      answer_body:
        "Hub meneruskan data ke semua port (layer 1), sedangkan Switch membaca tabel MAC dan hanya meneruskan frame ke port tujuan yang tepat (layer 2).",
      page_reference: "hlm. 17–18",
    },
    {
      card_index: 11,
      question: "Apa kegunaan port nomor 443 pada jaringan komputer?",
      question_hint: "Protokol web terenkripsi.",
      answer_heading: "HTTPS (HTTP Secure).",
      answer_body:
        "Port 443 adalah port standar untuk komunikasi web terenkripsi menggunakan TLS/SSL di atas TCP.",
      page_reference: "hlm. 15",
    },
    {
      card_index: 12,
      question: "Apa yang dimaksud dengan Default Gateway?",
      question_hint: "Pintu keluar dari subnet lokal.",
      answer_heading: "Router Penghubung ke Jaringan Lain.",
      answer_body:
        "Default Gateway adalah alamat IP antarmuka router di jaringan lokal yang digunakan perangkat untuk meneruskan paket ketika IP tujuan berada di luar subnet lokal.",
      page_reference: "hlm. 19–20",
    },
  ],
  quiz: {
    multiple_choice: [
      {
        question_number: 1,
        question:
          "Layer manakah pada model OSI yang bertanggung jawab untuk routing paket end-to-end?",
        options: [
          "Data Link Layer",
          "Network Layer",
          "Transport Layer",
          "Physical Layer",
        ],
        correct_index: 1,
        explanation:
          "Network (layer 3) menangani pengalamatan logis dan routing. Router memakai alamat IP tujuan serta tabel routing.",
      },
      {
        question_number: 2,
        question:
          "Pernyataan mana yang tepat tentang keandalan TCP dibandingkan UDP?",
        options: [
          "TCP menyediakan pengiriman andal dan berurutan melalui acknowledgment serta retransmisi.",
          "UDP menjamin pengiriman urut dengan nomor acknowledgment.",
          "TCP tidak memiliki mekanisme retransmisi paket.",
          "UDP memiliki overhead header lebih besar dibanding TCP.",
        ],
        correct_index: 0,
        explanation:
          "TCP menggunakan nomor urut, acknowledgment, dan retransmisi untuk menyediakan aliran byte andal dan berurutan. UDP tidak menyediakan jaminan tersebut.",
      },
      {
        question_number: 3,
        question: "Apa peran utama HTTP dalam komunikasi jaringan?",
        options: [
          "Menentukan alamat MAC perangkat.",
          "Memilih rute paket IP di router.",
          "Mengatur pertukaran permintaan dan respons sumber daya web pada layer aplikasi.",
          "Mengubah sinyal digital menjadi gelombang radio.",
        ],
        correct_index: 2,
        explanation:
          "HTTP adalah protokol layer aplikasi dengan pola permintaan–respons untuk sumber daya web, bukan protokol pengalamatan MAC atau routing.",
      },
      {
        question_number: 4,
        question:
          "Berapa jumlah host IPv4 yang dapat digunakan pada subnet /24 konvensional, setelah alamat jaringan dan broadcast dikecualikan?",
        options: [
          "256 host",
          "254 host",
          "128 host",
          "512 host",
        ],
        correct_index: 1,
        explanation:
          "/24 menyisakan 8 bit host: 2⁸ = 256 alamat total. Kurangi satu alamat jaringan dan satu broadcast, sehingga tersedia 254 host.",
      },
      {
        question_number: 5,
        question:
          "Switch Ethernet meneruskan frame berdasarkan alamat MAC tujuan. Fungsi ini berada pada layer OSI mana?",
        options: [
          "Layer Physical",
          "Layer Data Link",
          "Layer Network",
          "Layer Transport",
        ],
        correct_index: 1,
        explanation:
          "Switch Ethernet bekerja pada Data Link (layer 2) untuk forwarding frame berdasarkan tabel MAC. Routing IP adalah fungsi layer Network.",
      },
    ],
    essays: [
      {
        essay_number: 1,
        topic: "TCP dan UDP",
        prompt:
          "Bandingkan TCP dan UDP dari sisi keandalan, urutan data, dan overhead. Berikan satu contoh penggunaan yang tepat untuk masing-masing protokol beserta alasannya.",
        reference_points:
          "TCP: connection-oriented, ACK, sequence number, retransmisi, transfer berkas. UDP: connectionless, low overhead, no retransmission, audio/video streaming real-time.",
      },
      {
        essay_number: 2,
        topic: "Proses enkapsulasi",
        prompt:
          "Jelaskan proses enkapsulasi saat sebuah komputer mengirim data aplikasi melalui jaringan. Sebutkan urutan unit data dan peran port, alamat IP, serta alamat MAC.",
        reference_points:
          "Urutan data: Data -> Segmen/Datagram -> Paket -> Frame -> Bit. Port untuk identifikasi proses/aplikasi, IP untuk alamat logis antarjaringan, MAC untuk pengiriman fisik link lokal.",
      },
    ],
  },
};

export const mockQuizEvaluation: QuizEvaluationResult = {
  quiz_result: {
    mcq_score: 80,
    correct_answers: 4,
    wrong_answers: 1,
    priority_focus: {
      topic: "subnetting dan pengalamatan IPv4",
      reason:
        "Kamu memilih 256 host; jumlah itu mencakup alamat jaringan dan broadcast.",
    },
    recommendation: {
      title: "Kuasai 256 alamat vs 254 host.",
      description:
        "Ulangi ringkasan subnet /24, tulis rentang host 192.168.1.0/24, lalu latih perbedaan alamat jaringan dan broadcast.",
      target_section_anchor: "#section-05",
    },
    mcq_reviews: [
      {
        question_number: 1,
        is_correct: true,
        user_selected_index: 1,
        correct_index: 1,
        explanation:
          "Network (layer 3) menangani pengalamatan logis dan routing. Router memakai alamat IP tujuan serta tabel routing.",
      },
      {
        question_number: 2,
        is_correct: true,
        user_selected_index: 0,
        correct_index: 0,
        explanation:
          "TCP menggunakan nomor urut, acknowledgment, dan retransmisi untuk menyediakan aliran byte andal dan berurutan. UDP tidak menyediakan jaminan tersebut.",
      },
      {
        question_number: 3,
        is_correct: true,
        user_selected_index: 2,
        correct_index: 2,
        explanation:
          "HTTP adalah protokol layer aplikasi dengan pola permintaan–respons untuk sumber daya web, bukan protokol pengalamatan MAC atau routing.",
      },
      {
        question_number: 4,
        is_correct: false,
        user_selected_index: 0, // Memilih 256
        correct_index: 1, // Kunci 254
        explanation:
          "/24 menyisakan 8 bit host: 2⁸ = 256 alamat total. Kurangi satu alamat jaringan dan satu broadcast, sehingga tersedia 254 host.",
      },
      {
        question_number: 5,
        is_correct: true,
        user_selected_index: 1,
        correct_index: 1,
        explanation:
          "Switch Ethernet bekerja pada Data Link (layer 2) untuk forwarding frame berdasarkan tabel MAC. Routing IP adalah fungsi layer Network.",
      },
    ],
    essay_reviews: [
      {
        essay_number: 1,
        topic: "TCP dan UDP",
        user_answer:
          "TCP menjaga pengiriman data tetap andal dan berurutan melalui acknowledgment serta retransmisi. Saya memilih TCP untuk transfer berkas agar data lengkap. UDP tidak menjamin urutan atau kedatangan dan overhead-nya lebih kecil. UDP cocok untuk panggilan suara langsung, karena keterlambatan lebih mengganggu daripada kehilangan sedikit data.",
        ai_feedback:
          "Pemilihan transfer berkas dan panggilan suara sudah sesuai. Kamu menjelaskan keandalan dan urutan dengan baik. Perkuat bagian overhead: jelaskan pembentukan koneksi TCP dan bahwa aplikasi di atas UDP dapat menambahkan mekanisme keandalan sendiri.",
      },
      {
        essay_number: 2,
        topic: "Proses enkapsulasi",
        user_answer:
          "Data aplikasi turun ke transport dan menjadi segmen TCP atau datagram UDP. Kemudian IP menambahkan informasi alamat menjadi paket. Data Link membungkus paket sebagai frame, lalu Physical mengirim bit. Port menunjukkan layanan atau proses, IP menunjukkan tujuan jaringan, dan MAC dipakai untuk pengiriman di link lokal. Penerima membuka header dengan urutan terbalik.",
        ai_feedback:
          "Urutan data → segmen/datagram → paket → frame → bit sudah tepat. Peran port, IP, dan MAC juga jelas. Tambahkan bahwa header frame berubah pada setiap link yang dilalui router, sementara alamat IP tujuan akhir umumnya tetap tanpa NAT.",
      },
    ],
  },
};

export const mockDefaultProfile: ProfileRecord = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Aditya Ramadhan",
  email: "aditya.r@example.com",
  role_title: "Mahasiswa teknik",
  motto: "Ringkas. Pahami. Uji dirimu.",
  major: "Teknik Informatika",
  semester: 5,
  academic_period: "Semester ganjil · 2026/2027",
  weekly_target_sessions: 4,
  completed_sessions_this_week: 3,
  reminder_enabled: true,
  email_summary_enabled: false,
  reduced_motion: false,
  created_at: new Date().toISOString(),
};

export const mockStudyKitsList: StudyKitRecord[] = [
  {
    id: "demo-jaringan-komputer",
    user_id: "00000000-0000-0000-0000-000000000001",
    course_name: "Jaringan Komputer",
    topic_title: "Model OSI & TCP/IP",
    file_name: "Jaringan_Komputer_Bab_03.pdf",
    file_size_label: "2,4 MB · 24 halaman",
    page_count: 24,
    quiz_status: "unfinished",
    last_mcq_score: 80,
    kit_content: mockStudyKitContent,
    quiz_evaluation: mockQuizEvaluation,
    created_at: "2026-10-23T09:15:00Z",
    updated_at: "2026-10-23T09:30:00Z",
  },
  {
    id: "demo-pemrograman-web",
    user_id: "00000000-0000-0000-0000-000000000001",
    course_name: "Pemrograman Web",
    topic_title: "HTTP, HTML & CSS",
    file_name: "Pemrograman_Web_02.pdf",
    file_size_label: "1,8 MB · 18 halaman",
    page_count: 18,
    quiz_status: "completed",
    last_mcq_score: 80,
    kit_content: mockStudyKitContent,
    created_at: "2026-10-22T19:40:00Z",
    updated_at: "2026-10-22T20:10:00Z",
  },
  {
    id: "demo-sistem-basis-data",
    user_id: "00000000-0000-0000-0000-000000000001",
    course_name: "Sistem Basis Data",
    topic_title: "Relasi & normalisasi",
    file_name: "SBD_Normalisasi_04.pdf",
    file_size_label: "3,2 MB · 32 halaman",
    page_count: 32,
    quiz_status: "not-started",
    last_mcq_score: null,
    kit_content: mockStudyKitContent,
    created_at: "2026-10-22T16:20:00Z",
    updated_at: "2026-10-22T16:20:00Z",
  },
  {
    id: "demo-sistem-operasi",
    user_id: "00000000-0000-0000-0000-000000000001",
    course_name: "Sistem Operasi",
    topic_title: "Proses & penjadwalan",
    file_name: "SO_Penjadwalan_CPU.pdf",
    file_size_label: "2,0 MB · 20 halaman",
    page_count: 20,
    quiz_status: "completed",
    last_mcq_score: 80,
    kit_content: mockStudyKitContent,
    created_at: "2026-10-21T20:00:00Z",
    updated_at: "2026-10-21T20:30:00Z",
  },
];

export const mockActivityLogs: ActivityLogRecord[] = [
  {
    id: "act-1",
    study_kit_id: "demo-jaringan-komputer",
    course_name: "Jaringan Komputer",
    action_description: "Kuis dilanjutkan · 2 PG terisi",
    created_at: "Hari ini, 09.15",
  },
  {
    id: "act-2",
    study_kit_id: "demo-pemrograman-web",
    course_name: "Pemrograman Web",
    action_description: "Kuis selesai · Skor PG 80/100",
    created_at: "Kemarin, 19.40",
  },
  {
    id: "act-3",
    study_kit_id: "demo-sistem-basis-data",
    course_name: "Sistem Basis Data",
    action_description: "Study Kit dibuat · 32 halaman",
    created_at: "22 Oktober, 16.20",
  },
  {
    id: "act-4",
    study_kit_id: "demo-sistem-operasi",
    course_name: "Sistem Operasi",
    action_description: "Kuis selesai · Skor PG 80/100",
    created_at: "21 Oktober, 20.00",
  },
];
