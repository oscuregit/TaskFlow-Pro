# TaskFlow Pro - Proje ve Gereksinim Dosyası

## 1. Proje Özeti
TaskFlow Pro; serbest çalışanlar (freelancer), küçük ekipler ve proje yöneticileri için tasarlanmış, takvim tabanlı, akıllı önceliklendirme ve finansal takip özelliklerine sahip kapsamlı bir iş yönetim uygulamasıdır. Uygulama, işlerin sadece zamanında teslim edilmesini değil, aynı zamanda karlılık ve zorluk derecelerine göre en verimli şekilde sıralanmasını sağlar.

## 2. Temel Modüller ve İşlevler

### 2.1. Dashboard (Kontrol Paneli)
Uygulamanın ana ekranıdır. Kullanıcıya genel durumu tek bakışta özetler:
*   **Günün Özeti:** Bugün teslim edilecek veya üzerinde çalışılması gereken işler.
*   **Finansal Özet:** Bu ayki toplam beklenen gelir, gerçekleşen gelir ve giderler.
*   **Öncelik Top 3:** Akıllı algoritma tarafından belirlenen, hemen başlanması gereken en acil/karlı 3 iş.
*   **Performans:** Tamamlanan işler ve tahmini/gerçekleşen zaman analizleri.

### 2.2. Takvim Görünümü
İşlerin zaman çizelgesinde görselleştirildiği modül:
*   Aylık, Haftalık ve Günlük görünümler.
*   Takvim üzerinden sürükle-bırak (drag & drop) ile tarih değiştirme.
*   Takvimdeki boş bir güne tıklayarak hızlı iş ekleme (Quick Add).
*   İş türüne veya müşteriye göre renk kodlaması.

### 2.3. Kanban Panosu (İş Durumları)
İşlerin süreç içindeki durumlarını takip etmek için sütunlu görünüm:
*   **Sütunlar:** "Henüz Başlamadı", "Aktif/Devam Eden", "Beklemede (Müşteri Onayı vb.)", "Bitti".
*   Sürükle-bırak ile işlerin durumunu hızlıca güncelleme.

### 2.4. Gelişmiş Görev Kartları (Task Details)
Her bir işin tüm detaylarının tutulduğu merkez:
*   **Temel Bilgiler:** İşin Adı, Açıklaması, Teslim Tarihi, Müşteri/Firma seçimi.
*   **Alt Görevler (Checklist):** İşin adımlara bölünmesi ve ilerleme yüzdesi (%50 tamamlandı vb.).
*   **Zaman Takibi:** Tahmini harcanacak süre ve iş bittiğinde girilen gerçekleşen süre.
*   **Zaman Tüneli (Timeline) & Notlar:** Müşteri ile yapılan görüşmelerin, revize taleplerinin ve ara güncellemelerin tarih/saat damgasıyla eklendiği log defteri.

### 2.5. Finans Modülü (Gelir/Gider Takibi)
İşin karlılığını ölçmek için görev kartına entegre modül:
*   **Beklenen Gelir:** İşten kazanılacak toplam tutar.
*   **Giderler:** Bu iş için yapılan harcamalar (Lisans alımı, dışarıdan hizmet, yol masrafı vb.). Kalem kalem eklenebilir.
*   **Net Kar:** Gelir - Gider formülü ile otomatik hesaplanır.
*   *Not: Bu veriler Dashboard'daki genel finansal özeti besler.*

### 2.6. Akıllı Önceliklendirme Algoritması (Scoring System)
İşlerin hangi sırayla yapılacağını belirleyen dinamik puanlama sistemi. Puanlama şu metriklerin kombinasyonuyla otomatik hesaplanır:
1.  **Teslim Tarihi (Aciliyet):** Tarih yaklaştıkça puan artar.
2.  **Finansal Değer (Karlılık):** Net karı yüksek olan işler daha yüksek puan alır (Birim zamana düşen kar hesaplanabilir: Net Kar / Tahmini Süre).
3.  **Zorluk Derecesi (1-10):** Kullanıcının belirlediği zorluk. (Zor işler enerjinin yüksek olduğu zamanlara veya öncelik sırasına göre formüle dahil edilir).
*   *Sonuç:* Her iş 1 ile 100 arasında bir "Öncelik Skoru" alır ve listeler varsayılan olarak bu skora göre dizilir.

### 2.7. Mini CRM ve Etiketleme
*   **Müşteri Yönetimi:** İşler oluşturulurken bir müşteriye bağlanır. Geçmişe dönük "X müşterisine ne kadar iş yaptık, ne kadar kar ettik?" raporlaması yapılabilir.
*   **Etiketler (Tags):** #Tasarım, #Yazılım, #Acil, #Revize gibi etiketlerle işleri filtreleyebilme.

## 3. Kullanıcı Deneyimi (UI/UX) ve Tasarım
*   **Tema:** Modern, temiz ve profesyonel bir arayüz. Koyu (Dark) ve Açık (Light) tema desteği.
*   **Erişilebilirlik:** Her ekranda sabit duran "Yeni İş Ekle" butonu.
*   **Görsel Geri Bildirimler:** Yaklaşan işler için uyarı renkleri (Sarı/Kırmızı), tamamlanan işler için tatmin edici yeşil tonlar ve üstü çizik metinler.

## 4. Teknik Altyapı
*   **Frontend:** React.js, Vite, TypeScript.
*   **Stil ve UI Bileşenleri:** Tailwind CSS, Shadcn UI, Lucide Icons.
*   **Veri Saklama:** Başlangıç aşamasında tüm veriler tarayıcının yerel hafızasında (Local Storage) tutulacaktır. (İleride bulut tabanlı bir veritabanına - Firebase vb. - geçişe uygun mimari kurulacaktır).
*   **Takvim ve Sürükle-Bırak:** Modern takvim kütüphaneleri (örn: react-big-calendar veya özel yapım) ve dnd-kit (sürükle bırak için).
