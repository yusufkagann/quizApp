const questions = [
    {
        question: "1. İnsanların bir araya gelerek toplumu oluşturmasındaki temel itici güç aşağıdakilerden hangisidir?",
        answers: ["Sadece ekonomik zenginliği artırmak", "Güvenlik, sosyalleşme, yardımlaşma gibi temel ihtiyaçları karşılamak", "Diğer toplumlarla rekabet etmek", "Siyasi sınırları genişletmek"],
        correctIndex: 1,
        timeLimit: 20,
        explanation: "Belgeye göre insan sosyal bir varlıktır ve toplum; güvenlik ihtiyacı, ekonomik ihtiyaçlar, sosyal ilişkiler kurma ve yardımlaşma gibi çekim kuvvetleri etrafında bir araya gelen insanların oluşturduğu bir birlikteliktir."
    },
    {
        question: "2. Düzenleyici bir mekanizma olan toplumsal kuralların en temel işlevi nedir?",
        answers: ["Bireylerin istedikleri her şeyi özgürce yapabilmesini sağlamak", "Sadece devletin gücünü otoriterleştirmek", "Toplumsal karmaşayı önleyerek insanların bir arada yaşayabilmesini sağlamak", "Ekonomik eşitsizlikleri tamamen ortadan kaldırmak"],
        correctIndex: 2,
        timeLimit: 20,
        explanation: "Metinde, toplu halde yaşamanın getirdiği karmaşayı önlemek ve insanların bir arada yaşayabilmesi için davranışları sınırlandıran toplumsal kuralların zorunlu olduğu açıkça belirtilmektedir."
    },
    {
        question: "3. \"Başkasının malına zarar vermemek\" ve \"Yalan söylememek\" eylemleri sırasıyla hangi ahlak kuralı türlerine örnektir?",
        answers: ["Subjektif Ahlak - Objektif Ahlak", "Objektif Ahlak - Subjektif Ahlak", "Evrensel Ahlak - Yöresel Ahlak", "Toplumsal Ahlak - Dini Ahlak"],
        correctIndex: 1,
        timeLimit: 20,
        explanation: "Belgede kişinin toplumdaki diğer bireylerle alakalı kuralları (örneğin başkasının malına zarar vermemek) \"Objektif Ahlak Kuralları\" olarak tanımlanmıştır. Kişinin tamamen kendisiyle ilgili, kişiye özel kuralları ise (örneğin yalan söylememek) \"Subjektif Ahlak Kuralları\"dır."
    },
    {
        question: "4. Toplumda uzun süre uygulanarak alışkanlık haline gelen gelenek (örf ve adet) kurallarına uyulmadığında karşılaşılan temel yaptırım nedir?",
        answers: ["Hapis veya para cezası", "Sadece kişinin içsel vicdan azabı", "Hükümsüzlük", "Ayıplanma, dışlanma ve güçlü toplumsal tepki"],
        correctIndex: 3,
        timeLimit: 20,
        explanation: "Geleneklerin yaptırımı olarak, uyulmadığı takdirde kişinin ayıplanma, dışlanma ve güçlü bir toplumsal tepki ile karşılaşacağı ifade edilmiştir."
    },
    {
        question: "5. Hukuk kurallarını ahlak, din ve gelenek gibi diğer toplumsal kurallardan ayıran en temel felsefi fark nedir?",
        answers: ["Devlet gücüyle desteklenmiş maddi bir yaptırıma sahip olması", "Sadece yazılı bir forma sahip olması", "Sadece iyi bir insan olmayı amaçlaması", "İnsanların iç dünyasına ve vicdanına hitap etmesi"],
        correctIndex: 0,
        timeLimit: 20,
        explanation: "Metne göre hukuku diğer kurallardan ayıran temel felsefe, devlet gücüyle desteklenmiş maddi bir yaptırıma sahip olmasıdır."
    },
    {
        question: "6. Ahlak ve hukuk kurallarının temel hedefleri karşılaştırıldığında, aşağıdaki ifadelerden hangisi doğrudur?",
        answers: ["Hukuk \"iyi insan\" olmayı, ahlak ise \"iyi vatandaş\" olmayı hedefler.", "Ahlak \"iyi insan\" olmayı, hukuk ise \"iyi vatandaş\" olmayı hedefler.", "Her ikisi de sadece insanın ahiret inancını düzenlemeyi hedefler.", "Aralarında amaç açısından hiçbir fark yoktur, ikisi de tamamen aynı şeyleri yasaklar."],
        correctIndex: 1,
        timeLimit: 20,
        explanation: "Hukukun karakteri ve sınırları açıklanırken, ahlakın 'iyi insan' olmayı, hukukun ise 'iyi vatandaş' olmayı hedeflediği doğrudan vurgulanmıştır."
    },
    {
        question: "7. Borcunu ödemeyen bir kişinin malına devlet tarafından zorla el konulması, aşağıdaki hukuki yaptırım türlerinden hangisine örnektir?",
        answers: ["Tazminat", "Hükümsüzlük", "Cebri İcra", "İdari Ceza"],
        correctIndex: 2,
        timeLimit: 20,
        explanation: "Hukuki müeyyideler tablosunda \"Cebri İcra\", borcunu ödemeyenlerin malına devlet tarafından el konulması durumu olarak tanımlanmıştır."
    },
    {
        question: "8. Bir kuralın kanuna uygun olmasına \"Hukukilik\" denirken, o kuralın toplum vicdanında karşılık bulup halk tarafından adil ve haklı görülmesine ne ad verilir?",
        answers: ["Zorunluluk", "Meşruiyet", "Cebir", "Süreklilik"],
        correctIndex: 1,
        timeLimit: 20,
        explanation: "Meşruiyet kavramı, kuralın toplum vicdanında ve etik değerlerde karşılık bulması, ayrıca halkın yönetimi kabul etmesi ve haklı görmesi olarak tanımlanmıştır."
    },
    {
        question: "9. Gücün, liderin halkı derinden etkileyen olağanüstü kişisel özelliklerinden kaynaklandığı meşruiyet türü aşağıdakilerden hangisidir?",
        answers: ["Geleneksel Meşruiyet", "Hukuki-Rasyonel Meşruiyet", "Dini Meşruiyet", "Karizmatik Meşruiyet"],
        correctIndex: 3,
        timeLimit: 20,
        explanation: "Belgede \"Karizmatik Meşruiyet\", gücün liderin halkı derinden etkileyen olağanüstü kişisel özelliklerinden kaynaklanması olarak açıklanmıştır."
    },
    {
        question: "10. Modern demokratik devletlerin temeli olan; yönetimin akla, mantığa ve anayasal kurallara dayandığı meşruiyet türü hangisidir?",
        answers: ["Hukuki-Rasyonel Meşruiyet", "Geleneksel Meşruiyet", "Karizmatik Meşruiyet", "Dogmatik Meşruiyet"],
        correctIndex: 0,
        timeLimit: 20,
        explanation: "Otoritenin evrimi bölümünde \"Hukuki-Rasyonel Meşruiyet\", yönetimin akla, mantığa ve anayasal kurallara dayanması ve modern devletlerin temeli olması şeklinde ifade edilmiştir."
    },
    {
        question: "11. Bir toplumda sıkı kuralların ve hukukun var olduğu, ancak bu kuralların halk tarafından benimsenmediği (meşruiyetin olmadığı) durumda ortaya çıkan siyasi-toplumsal sonuç nedir?",
        answers: ["Sürdürülebilir Düzen", "Kararsızlık ve Lider Kültü", "Demokratik Barış", "Baskı ve Zorbalık"],
        correctIndex: 3,
        timeLimit: 20,
        explanation: "Belgedeki sentez şemasında, kurallar var ama meşruiyet yoksa bu durumun \"Baskı ve Zorbalık\" ile sonuçlanacağı açıkça denkleştirilmiştir."
    },
    {
        question: "12. Kuralların yaptırım gücünün en yumuşaktan (bireysel) en serte (devlet gücü) doğru sıralandığı \"Yaptırım Yelpazesi\" aşağıdakilerden hangisinde doğru verilmiştir?",
        answers: ["Hukuk -> Gelenek -> Ahlak", "Ahlak -> Gelenek -> Hukuk", "Gelenek -> Ahlak -> Hukuk", "Ahlak -> Hukuk -> Gelenek"],
        correctIndex: 1,
        timeLimit: 20,
        explanation: "Yaptırım yelpazesi şemasında kuralların bireyin iç dünyasından (vicdan azabı/ahlak) başlayıp, toplumun dışlayıcılığına (gelenek), en uç noktada ise devletin zor kullanma yetkisine (hukuk) doğru sertleştiği gösterilmiştir."
    }
];
