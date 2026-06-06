const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Admin password (o'zgartirish uchun shu yerda yangilang)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sushi2024';

app.use(express.json({ limit: '10mb' })); // support base64 images

// Static fayllar — lekin index.html avtomatik serve qilinmasligi uchun index: false
app.use(express.static(__dirname, { index: false }));

// Default data
const defaultCategories = ["Barchasi", "Roll va Sushilar", "Katta Setlar", "Issiq Taomlar", "Salatlar", "Ichimliklar"];
const defaultMenuItems = [
  {
    id: 1,
    name: "Filadelfiya Klassik",
    category: "Roll va Sushilar",
    price: 75000,
    weight: "250 g / 8 dona",
    desc: "Norvegiya lososi, qaymoqli pishloq, bodring, nori va guruch.",
    img: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80"
  },
  {
    id: 2,
    name: "Tokio Seti",
    category: "Katta Setlar",
    price: 320000,
    weight: "1200 g / 40 dona",
    desc: "Eng mashhur 5 xil rollar to'plami: Filadelfiya, Kaliforniya, Alyaska, va boshqalar.",
    img: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80"
  },
  {
    id: 3,
    name: "Issiq Ebi Tempura",
    category: "Roll va Sushilar",
    price: 85000,
    weight: "280 g / 8 dona",
    desc: "Qarsildoq tempura ichida qisqichbaqa, pishloq va unagi sousi.",
    img: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&q=80"
  },
  {
    id: 4,
    name: "Chuka Salati",
    category: "Salatlar",
    price: 45000,
    weight: "150 g",
    desc: "Dengiz o'tlari salati, yong'oqli sous va kunjut bilan.",
    img: "https://images.unsplash.com/photo-1540648639573-8c848de23f0a?w=600&q=80"
  },
  {
    id: 5,
    name: "Tomyam Sho'rvasi",
    category: "Issiq Taomlar",
    price: 95000,
    weight: "400 ml",
    desc: "Tailandcha achchiq va nordon sho'rva dengiz mahsulotlari bilan.",
    img: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80"
  },
  {
    id: 6,
    name: "Yaponcha Choy",
    category: "Ichimliklar",
    price: 25000,
    weight: "500 ml",
    desc: "An'anaviy sencha ko'k choyi, limon va yalpiz bilan.",
    img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80"
  },
  {
    id: 7,
    name: "Kaliforniya Roll",
    category: "Roll va Sushilar",
    price: 70000,
    weight: "240 g / 8 dona",
    desc: "Krab go'shti, avokado, tvorog pishloq va kunjut bilan.",
    img: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&q=80"
  },
  {
    id: 8,
    name: "Losos Nigiri",
    category: "Roll va Sushilar",
    price: 65000,
    weight: "180 g / 6 dona",
    desc: "Yangi losos bilan tayyorlangan an'anaviy yapon nigirilari.",
    img: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80"
  },
  {
    id: 9,
    name: "Osaka Seti",
    category: "Katta Setlar",
    price: 450000,
    weight: "1800 g / 60 dona",
    desc: "Katta ziyofat uchun premium set: 8 xil rol va nigirilar.",
    img: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=600&q=80"
  },
  {
    id: 10,
    name: "Unagi Roll",
    category: "Roll va Sushilar",
    price: 95000,
    weight: "260 g / 8 dona",
    desc: "Qovurilgan daryo balig'i, avokado va teriyaki sousi bilan.",
    img: "https://images.unsplash.com/photo-1617196034738-26c1b2b58f44?w=600&q=80"
  },
  {
    id: 11,
    name: "Miso Sho'rva",
    category: "Issiq Taomlar",
    price: 55000,
    weight: "350 ml",
    desc: "An'anaviy yapon miso sho'rvasi tofu va dengiz o'tlari bilan.",
    img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80"
  },
  {
    id: 12,
    name: "Avokado Salati",
    category: "Salatlar",
    price: 55000,
    weight: "180 g",
    desc: "Yangi avokado, pomidor, salat barglari va limon sous bilan.",
    img: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=600&q=80"
  },
  {
    id: 13,
    name: "Sushi Premium Seti",
    category: "Katta Setlar",
    price: 580000,
    weight: "2200 g / 72 dona",
    desc: "Restoranimizning eng yaxshi rollari va sushilari to'plami.",
    img: "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?w=600&q=80"
  },
  {
    id: 14,
    name: "Matcha Ichimlik",
    category: "Ichimliklar",
    price: 35000,
    weight: "400 ml",
    desc: "Sovuq yoki issiq matcha choy, sut yoki suv bilan tayyorlangan.",
    img: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&q=80"
  }
];

// Helper to read data from data.json
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = { categories: defaultCategories, menuItems: defaultMenuItems };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading data file:", error);
    return { categories: defaultCategories, menuItems: defaultMenuItems };
  }
}

// Helper to write data to data.json
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Error writing data file:", error);
    return false;
  }
}

// API Routes

// 1. Get Categories
app.get('/api/categories', (req, res) => {
  const data = readData();
  res.json(data.categories);
});

// 2. Add Category
app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: "Kategoriya nomi kiritilishi shart." });
  }
  
  const data = readData();
  const trimmedName = name.trim();
  if (data.categories.includes(trimmedName)) {
    return res.status(400).json({ error: "Ushbu kategoriya allaqachon mavjud." });
  }

  data.categories.push(trimmedName);
  writeData(data);
  res.status(201).json(data.categories);
});

// 3. Delete Category
app.delete('/api/categories/:name', (req, res) => {
  const { name } = req.params;
  const data = readData();
  
  data.categories = data.categories.filter(cat => cat !== name);
  writeData(data);
  res.json(data.categories);
});

// 4. Get Menu Items
app.get('/api/menu', (req, res) => {
  const data = readData();
  res.json(data.menuItems);
});

// 5. Add Menu Item
app.post('/api/menu', (req, res) => {
  const { name, category, price, weight, desc, img } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: "Taom nomi va narxi kiritilishi shart." });
  }

  const data = readData();
  const newItem = {
    id: Date.now(),
    name,
    category: category || "Barchasi",
    price: Number(price),
    weight: weight || "",
    desc: desc || "Yangi taom...",
    img: img || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
  };

  data.menuItems.unshift(newItem); // Add to beginning
  writeData(data);
  res.status(201).json(newItem);
});

// 6. Edit Menu Item
app.put('/api/menu/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, category, price, weight, desc, img } = req.body;
  const data = readData();

  const index = data.menuItems.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Taom topilmadi." });
  }

  data.menuItems[index] = {
    ...data.menuItems[index],
    ...(name !== undefined && { name }),
    ...(category !== undefined && { category }),
    ...(price !== undefined && { price: Number(price) }),
    ...(weight !== undefined && { weight }),
    ...(desc !== undefined && { desc }),
    ...(img !== undefined && { img }),
  };

  writeData(data);
  res.json(data.menuItems[index]);
});

// 7. Delete Menu Item
app.delete('/api/menu/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  
  data.menuItems = data.menuItems.filter(item => item.id !== id);
  writeData(data);
  res.json({ success: true, message: "Taom muvaffaqiyatli o'chirildi." });
});

// Admin login API
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: Buffer.from(ADMIN_PASSWORD).toString('base64') });
  } else {
    res.status(401).json({ success: false, error: "Parol noto'g'ri!" });
  }
});

// Admin token verify
app.get('/api/admin/verify', (req, res) => {
  const auth = req.headers['x-admin-token'];
  const expected = Buffer.from(ADMIN_PASSWORD).toString('base64');
  if (auth === expected) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
});

// /admin route — admin.html ni serve qiladi (boshqa route'lardan OLDIN)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Barcha boshqa route'lar — index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sushi Bar server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
