import type { ArticleCategory, ArticleItem, ArticleDetail } from '../models/ArticleModel'

export interface IArticleRepository {
  getAll(category?: ArticleCategory): Promise<ArticleItem[]>
  getBySlug(slug: string): Promise<ArticleDetail | null>
}

export class ArticleRepository implements IArticleRepository {
  private articles: ArticleDetail[] = [
    {
      id: '1',
      slug: 'tips-merawat-baju-katun-agar-tidak-melar',
      title: '5 Tips Merawat Baju Katun Agar Serat Kain Awet dan Tidak Mudah Melar',
      excerpt: 'Baju katun favoritmu sering menyusut atau melar setelah beberapa kali dicuci? Simak teknik perendaman dan suhu air yang tepat berikut ini.',
      category: 'Tips Perawatan',
      readingTime: '4 menit baca',
      author: 'Tim Ahli Nuy Laundry',
      publishedAt: '24 Oktober 2026',
      thumbnailUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80',
      content: `
        <p>Pakaian berbahan katun merupakan primadona di iklim tropis seperti Indonesia. Bahannya yang adem, menyerap keringat, dan nyaman di kulit membuatnya menjadi pilihan utama untuk pakaian sehari-hari.</p>
        <p>Namun, seringkali kita mendapati baju katun kesayangan menjadi menciut atau sebaliknya melar di bagian leher dan pundak. Berikut 5 langkah penting merawat pakaian katun:</p>
        
        <h3>1. Pisahkan Berdasarkan Warna dan Ketebalan</h3>
        <p>Jangan pernah mencampur katun putih dengan pakaian berwarna gelap, terutama pada cucian pertama. Gesekan antar serat kain yang berbeda ketebalan juga dapat menyebabkan bulu halus timbul pada permukaan kain.</p>

        <h3>2. Hindari Penggunaan Air yang Terlalu Panas</h3>
        <p>Air panas dapat merusak elastisitas serat katun alami dan menyebabkan penyusutan permanen. Gunakan air suhu ruangan atau suam-suam kuku (maksimal 30°C).</p>

        <h3>3. Gunakan Deterjen Cair yang Lembut</h3>
        <p>Deterjen bubuk yang kasar terkadang meninggalkan residu putih di pori-pori katun. Deterjen cair ber-pH seimbang jauh lebih aman untuk mempertahankan kelembutan serat katun.</p>

        <h3>4. Jemur dengan Posisi Terbalik (Inside-Out)</h3>
        <p>Paparan sinar matahari langsung dapat memudarkan warna cerah pakaian katun. Balik bagian dalam baju ke luar sebelum menjemur, dan hindari penggunaan gantungan (hanger) berat saat baju masih basah kuyup agar bagian kerah tidak melar ke bawah.</p>

        <h3>5. Gunakan Setrika Uap (Steam Iron)</h3>
        <p>Setrika uap merapikan kusut tanpa menekan serat kain secara agresif, menjaga pakaian tetap halus dan mengembang sempurna.</p>
      `
    },
    {
      id: '2',
      slug: 'kapan-harus-memilih-dry-clean-dibanding-cuci-biasa',
      title: 'Kapan Harus Memilih Dry Clean Dibanding Cuci Biasa? Jangan Sampai Salah!',
      excerpt: 'Jas, kebaya, atau kain sutra tidak boleh terkena air biasa. Pahami perbedaan mendasar antara dry clean kimiawi dan wet laundry standar.',
      category: 'Panduan Bahan',
      readingTime: '5 menit baca',
      author: 'Master Fabric Specialist',
      publishedAt: '20 Oktober 2026',
      thumbnailUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
      content: `
        <p>Banyak orang mengira dry clean hanyalah istilah keren untuk laundry pakaian mahal. Padahal, <em>Dry Cleaning</em> adalah proses pencucian pakaian menggunakan cairan pelarut khusus tanpa menggunakan air (solvent based).</p>

        <h3>Bahan yang WAJIB Dry Clean:</h3>
        <ul>
          <li><strong>Wol dan Cashmere:</strong> Air akan menyebabkan wol mengerut hingga 50% dari ukuran aslinya.</li>
          <li><strong>Sutra Murni (Silk):</strong> Sutra mudah kehilangan kilau alaminya jika terkena deterjen biasa.</li>
          <li><strong>Jas dan Blazer Ber-padding:</strong> Busa bahu (padding) jas akan rusak dan kehilangan bentuk tegasnya jika dimasukkan ke mesin cuci biasa.</li>
          <li><strong>Gaun Pesta & Kebaya Berpayet:</strong> Payet dan manik-manik rentan rontok jika mengalami putaran mekanik mesin cuci basah.</li>
        </ul>

        <p>Di Nuy Laundry, layanan dry clean kami menggunakan pelarut ramah lingkungan yang tidak meninggalkan bau menyengat dan aman untuk serat kain paling halus sekalipun.</p>
      `
    },
    {
      id: '3',
      slug: 'panduan-merawat-bed-cover-tebal-agar-bebas-tungau',
      title: 'Panduan Merawat Bed Cover Tebal Agar Tetap Empuk, Harum, dan Bebas Tungau',
      excerpt: 'Tidur nyenyak berawal dari kasur dan bed cover yang bersih. Ketahui siklus mencuci bed cover yang ideal untuk mencegah alergi kulit.',
      category: 'Tips Perawatan',
      readingTime: '3 menit baca',
      author: 'Nuy Care Team',
      publishedAt: '15 Oktober 2026',
      thumbnailUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80',
      content: `
        <p>Bed cover dan selimut tebal menyerap jutaan sel kulit mati, keringat, dan debu setiap malam. Tanpa disadari, ini menjadi tempat berkembang biak yang sempurna bagi tungau debu rumah (dust mites).</p>

        <h3>Berapa Sering Bed Cover Harus Dicuci?</h3>
        <p>Para ahli kesehatan merekomendasikan mencuci sprei setiap 1–2 minggu sekali, dan bed cover tebal minimal setiap 3–4 minggu sekali.</p>

        <h3>Mengapa Mesin Cuci Rumah Tangga Sering Gagal Mencuci Bed Cover?</h3>
        <p>Kapasitas drum mesin cuci rumahan (6-8 kg) umumnya terlalu sempit untuk bed cover ukuran King/Queen. Akibatnya, deterjen tidak terbilas bersih dan dakron di dalamnya menggumpal. Nuy Laundry menggunakan mesin kapasitas jumbo komersial 20 kg sehingga sirkulasi air dan pembilasan berjalan maksimal.</p>
      `
    },
    {
      id: '4',
      slug: 'rahasia-wangi-laundry-tahan-lama-7-hari',
      title: 'Rahasia Wangi Laundry Tahan Lama Sampai 7 Hari di Dalam Lemari',
      excerpt: 'Penasaran kenapa pakaian yang dicuci di laundry bisa wangi berminggu-minggu? Ini rahasia formulasi aroma dan proses pengeringannya.',
      category: 'Info & Promo',
      readingTime: '3 menit baca',
      author: 'Aromatherapy Specialist',
      publishedAt: '10 Oktober 2026',
      thumbnailUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80',
      content: `
        <p>Banyak pelanggan heran mengapa wangi cucian di Nuy Laundry begitu lembut namun bertahan hingga berminggu-minggu di dalam lemari pakaian.</p>
        <p>Kuncinya terletak pada 3 hal: tingkat kekeringan 100% menggunakan dryer gas komersial (bukan dijemur lembab), pewangi grade konsentrat mikroenkapsulasi yang mengunci partikel aroma, serta pengemasan plastik kedap udara segera setelah pakaian disetrika.</p>
      `
    }
  ]

  private apiBase: string

  constructor(apiBase = 'http://localhost:8080') {
    this.apiBase = apiBase
  }

  private normalizeCategory(cat: string): string {
    const upper = (cat || '').toUpperCase()
    if (upper === 'TIPS_PERAWATAN' || upper.includes('PERAWATAN')) return 'Tips Perawatan'
    if (upper === 'PANDUAN_BAHAN' || upper.includes('BAHAN')) return 'Panduan Bahan'
    if (upper === 'INFO_PROMO' || upper.includes('PROMO')) return 'Info & Promo'
    if (upper === 'INFO_MENARIK' || upper.includes('MENARIK')) return 'Info Menarik'
    return cat || 'Tips Perawatan'
  }

  private mapBackendToArticle(raw: any): ArticleDetail {
    const rawThumb = raw.thumbnailUrl || ''
    const thumb = rawThumb.startsWith('http') 
      ? rawThumb 
      : rawThumb ? `${this.apiBase}/api/v1/files/${rawThumb}` : 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80'

    let formattedDate = 'Hari ini'
    if (raw.publishedAt || raw.createdAt) {
      try {
        formattedDate = new Date(raw.publishedAt || raw.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      } catch {}
    }

    return {
      id: String(raw.id || ''),
      slug: String(raw.slug || ''),
      title: String(raw.title || ''),
      excerpt: String(raw.excerpt || ''),
      category: this.normalizeCategory(raw.category),
      readingTime: String(raw.readingTime || '3 menit baca'),
      author: String(raw.authorName || 'Tim Ahli Nuy Laundry'),
      publishedAt: formattedDate,
      thumbnailUrl: thumb,
      content: String(raw.content || '')
    }
  }

  async getAll(category: ArticleCategory = 'Semua'): Promise<ArticleItem[]> {
    try {
      const res = await fetch(`${this.apiBase}/api/v1/articles?isPublished=true&size=50`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.ok) {
        const json = await res.json()
        const items = json?.data?.content
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map((i: any) => this.mapBackendToArticle(i))
          if (category === 'Semua') {
            return mapped.map(({ content, relatedSlugs, ...rest }) => rest)
          }
          return mapped
            .filter(a => a.category.toLowerCase() === category.toLowerCase())
            .map(({ content, relatedSlugs, ...rest }) => rest)
        }
      }
    } catch {
      // Fallback to sample static articles if API is unavailable
    }

    // Fallback to static articles
    if (category === 'Semua') {
      return this.articles.map(({ content, relatedSlugs, ...rest }) => rest)
    }
    return this.articles
      .filter(a => a.category.toLowerCase() === category.toLowerCase())
      .map(({ content, relatedSlugs, ...rest }) => rest)
  }

  async getBySlug(slug: string): Promise<ArticleDetail | null> {
    try {
      const res = await fetch(`${this.apiBase}/api/v1/articles/${encodeURIComponent(slug)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.ok) {
        const json = await res.json()
        if (json?.data) {
          return this.mapBackendToArticle(json.data)
        }
      }
    } catch {
      // Fallback to sample static articles
    }

    const found = this.articles.find(a => a.slug === slug)
    return found || null
  }
}
