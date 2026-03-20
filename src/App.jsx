import React, { useEffect, useMemo, useState } from "react";
import { Instagram, Facebook, Mail,ShoppingCart, Search, Trash2, User, LogIn, LogOut, Package, CheckCircle2, X, Menu } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import vestImg from"./assets/vest.png";
import capImg from"./assets/cap.png";
import hoodieImg from "./assets/hoodie.png";
import jacketImg from "./assets/jacket.png";
import tshirtImg from "./assets/tshirt.png";
const PRODUCTS = [
  {
    id: 1,
    name: "KHUU Hoodie",
    category: "Hoodie, Outerwear",
    price: 89000,
    size: ["S", "M", "L", "XL"],
    stock: true,
    image: hoodieImg,
    description: "Өдөр тутмын minimal загвартай, тав тухтай oversize hoodie.",
  },
  {
    id: 2,
    name: "KHUU Oversize T-Shirt",
    category: "T-Shirt",
    price: 49000,
    size: ["S", "M", "L"],
    stock: true,
    image:tshirtImg,
    description: "Цэвэрхэн хэв маягтай, брендийн өдөр тутмын tee.",
  },
  {
    id: 3,
    name: "KHUU Cargo Pants",
    category: "Pants",
    price: 99000,
    size: ["M", "L", "XL"],
    stock: true,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    description: "Streetwear хэв маягтай олон халаастай cargo өмд.",
  },
  {
    id: 4,
    name: "KHUU Signature Cap",
    category: "Accessories",
    price: 39000,
    size: ["Free"],
    stock: false,
    image:capImg,
    description: "Энгийн, цэвэрхэн logo-той cap.Хэмжээгээ өөрөө тааруулах боломжтой",
  },
  {
    id: 5,
    name: "KHUU Zip Jacket",
    category: "Outerwear",
    price: 129000,
    size: ["M", "L", "XL"],
    stock: true,
    image:jacketImg,
    description: "Дулаан материалтай, загварлаг teddy.",
  },
  {
    id: 6,
    name: "KHUU Basic Vest",
    category: "Outerwear",
    price: 59000,
    size: ["S", "M", "L"],
    stock: true,
    image: vestImg,
    description: "Зуны улиралд тохирсон comfy хантааз.",
  },
];

const CATEGORIES = ["All", ...new Set(PRODUCTS.map((p) => p.category))];

const formatPrice = (price) => new Intl.NumberFormat("mn-MN").format(price) + "₮";

const LS_USERS = "khuu_users";
const LS_CURRENT_USER = "khuu_current_user";
const LS_CART_PREFIX = "khuu_cart_";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function Modal({ open, onClose, children, wide = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${wide ? "max-w-4xl" : "max-w-md"} rounded-3xl bg-white p-6 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductCard({ product, onView, onAdd }) {
  return (
    <Card className="overflow-hidden rounded-3xl border-0 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-[4/5] overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{product.category}</p>
            <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {product.stock ? "Байгаа" : "Дууссан"}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-bold">{formatPrice(product.price)}</p>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => onView(product)}>
              Дэлгэрэнгүй
            </Button>
            <Button className="rounded-2xl" onClick={() => onAdd(product)} disabled={!product.stock}>
              Сагслах
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function KhuuBrandWebsite() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [authMode, setAuthMode] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const storedUsers = readJson(LS_USERS, []);
    const storedCurrentUser = readJson(LS_CURRENT_USER, null);
    setUsers(storedUsers);
    setCurrentUser(storedCurrentUser);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setCart([]);
      return;
    }
    const storedCart = readJson(`${LS_CART_PREFIX}${currentUser.email}`, []);
    setCart(storedCart);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(LS_CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${LS_CART_PREFIX}${currentUser.email}`, JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
      const searchMatch = product.name.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, search]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const addToCart = (product) => {
    if (!currentUser) {
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }

    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const changeQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError("");

    if (!form.email || !form.password || (authMode === "register" && !form.name)) {
      setAuthError("Бүх талбарыг бөглөнө үү.");
      return;
    }

    if (authMode === "register") {
      const exists = users.find((u) => u.email === form.email);
      if (exists) {
        setAuthError("Энэ имэйл бүртгэлтэй байна.");
        return;
      }
      const newUser = { name: form.name, email: form.email, password: form.password };
      const nextUsers = [...users, newUser];
      setUsers(nextUsers);
      setCurrentUser(newUser);
      setForm({ name: "", email: "", password: "" });
      setAuthOpen(false);
      return;
    }

    const user = users.find((u) => u.email === form.email && u.password === form.password);
    if (!user) {
      setAuthError("Имэйл эсвэл нууц үг буруу байна.");
      return;
    }
    setCurrentUser(user);
    setForm({ name: "", email: "", password: "" });
    setAuthOpen(false);
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    const nextUsers = users.filter((u) => u.email !== currentUser.email);
    setUsers(nextUsers);
    localStorage.removeItem(`${LS_CART_PREFIX}${currentUser.email}`);
    setCurrentUser(null);
    setCart([]);
    setCartOpen(false);
  };

  const confirmOrder = () => {
    if (!cart.length) return;
    setCart([]);
    if (currentUser) {
      localStorage.setItem(`${LS_CART_PREFIX}${currentUser.email}`, JSON.stringify([]));
    }
    setCheckoutDone(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-black tracking-[0.25em]">KHUU</h1>
            <p className="text-xs text-slate-500">Minimal streetwear brand</p>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" className="rounded-2xl">Нүүр</Button>
            <Button variant="ghost" className="rounded-2xl">Бүтээгдэхүүн</Button>
            <Button variant="ghost" className="rounded-2xl">Бренд</Button>
            {!currentUser ? (
              <Button className="rounded-2xl" onClick={() => { setAuthMode("login"); setAuthOpen(true); }}>
                <LogIn className="mr-2 h-4 w-4" /> Нэвтрэх
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge className="rounded-full px-3 py-2">{currentUser.name}</Badge>
                <Button variant="outline" className="rounded-2xl" onClick={() => setCurrentUser(null)}>
                  <LogOut className="mr-2 h-4 w-4" /> Гарах
                </Button>
              </div>
            )}
            <Button variant="outline" className="relative rounded-2xl" onClick={() => setCartOpen(true)}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Сагс
              {cartCount > 0 && (
                <span className="ml-1 rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">{cartCount}</span>
              )}
            </Button>
          </nav>

          <button
            className="rounded-2xl border p-2 md:hidden"
            onClick={() => setMobileMenu((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t bg-white md:hidden"
            >
              <div className="space-y-3 px-4 py-4">
                {!currentUser ? (
                  <Button className="w-full rounded-2xl" onClick={() => { setAuthMode("login"); setAuthOpen(true); setMobileMenu(false); }}>
                    Нэвтрэх
                  </Button>
                ) : (
                  <>
                    <div className="rounded-2xl bg-slate-100 p-3 text-sm">Сайн байна уу, {currentUser.name}</div>
                    <Button variant="outline" className="w-full rounded-2xl" onClick={() => { setCurrentUser(null); setMobileMenu(false); }}>
                      Гарах
                    </Button>
                  </>
                )}
                <Button variant="outline" className="w-full rounded-2xl" onClick={() => { setCartOpen(true); setMobileMenu(false); }}>
                  Сагс ({cartCount})
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
          <div className="space-y-6">
            <Badge className="rounded-full px-4 py-2">Онлайн захиалга</Badge>
            <h2 className="text-4xl font-black leading-tight sm:text-5xl">
              KHUU brand-ийн онлайн дэлгүүр
            </h2>
            <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Бүтээгдэхүүнээ танилцуулж, хэрэглэгчдээс захиалга авах энгийн, ойлгомжтой, responsive веб сайт.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-2xl px-6">Shop now</Button>
              <Button variant="outline" className="rounded-2xl px-6">Collection</Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1400&q=80"
              alt="KHUU Hero"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-[2rem] bg-white p-4 shadow-md md:grid-cols-[1fr_auto] md:items-center md:p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Бүтээгдэхүүн хайх..."
                className="h-12 rounded-2xl border-slate-200 pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Бүтээгдэхүүнүүд</h3>
              <p className="text-sm text-slate-500">{filteredProducts.length} бүтээгдэхүүн олдлоо</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={setSelectedProduct}
                onAdd={addToCart}
              />
            ))}
          </div>
        </section>
      </main>

<footer className="border-t bg-white">
  <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
    
    <div>
      <h4 className="text-xl font-black tracking-[0.25em]">KHUU</h4>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Онлайн орчинд бүтээгдэхүүн танилцуулах, захиалга авах процессыг хялбарчлах зориулалттай website.
      </p>
    </div>

    {/* Холбоо барих */}
    <div>
      <h5 className="font-semibold">Холбоо барих</h5>
      <div className="mt-4 flex items-center gap-4">

        {/* Instagram */}
        <a
          href="https://instagram.com/damn.docx"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-3 transition hover:bg-black hover:text-white"
        >
          <Instagram className="h-5 w-5" />
        </a>

        {/* Facebook */}
        <a
          href="https://facebook.com/akultamira"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-3 transition hover:bg-black hover:text-white"
        >
          <Facebook className="h-5 w-5" />
        </a>

        {/* Gmail */}
        <a
          href="mailto:tamirakhuu@gmail.com"
          className="rounded-full p-3 transition hover:bg-black hover:text-white"
        >
          <Mail className="h-5 w-5" />
        </a>

      </div>
    </div>

  </div>
</footer>

      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)} wide>
        {selectedProduct && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl bg-slate-100">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-5">
              <Badge className="rounded-full px-3 py-1">{selectedProduct.category}</Badge>
              <h3 className="text-3xl font-black">{selectedProduct.name}</h3>
              <p className="text-slate-600">{selectedProduct.description}</p>
              <div className="space-y-2 rounded-3xl bg-slate-50 p-4">
                <p><span className="font-semibold">Үнэ:</span> {formatPrice(selectedProduct.price)}</p>
                <p><span className="font-semibold">Хэмжээ:</span> {selectedProduct.size.join(", ")}</p>
                <p>
                  <span className="font-semibold">Барааны төлөв:</span>{" "}
                  {selectedProduct.stock ? "Байгаа" : "Одоогоор дууссан"}
                </p>
              </div>
              <Button className="rounded-2xl" disabled={!selectedProduct.stock} onClick={() => addToCart(selectedProduct)}>
                Сагсанд нэмэх
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={authOpen} onClose={() => setAuthOpen(false)}>
        <div className="mb-5 flex items-center gap-3">
          {authMode === "login" ? <LogIn className="h-6 w-6" /> : <User className="h-6 w-6" />}
          <h3 className="text-2xl font-bold">
            {authMode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
          </h3>
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          {authMode === "register" && (
            <Input
              className="h-11 rounded-2xl"
              placeholder="Нэр"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <Input
            className="h-11 rounded-2xl"
            placeholder="Имэйл"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            className="h-11 rounded-2xl"
            placeholder="Нууц үг"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {authError && <p className="text-sm text-red-500">{authError}</p>}

          <Button type="submit" className="h-11 w-full rounded-2xl">
            {authMode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          {authMode === "login" ? "Шинэ хэрэглэгч үү?" : "Бүртгэлтэй юу?"}{" "}
          <button
            className="font-semibold text-slate-900 underline"
            onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}
          >
            {authMode === "login" ? "Бүртгүүлэх" : "Нэвтрэх"}
          </button>
        </div>
      </Modal>

      <Modal open={cartOpen} onClose={() => setCartOpen(false)} wide>
        <div className="mb-6 flex items-center gap-3">
          <ShoppingCart className="h-6 w-6" />
          <h3 className="text-2xl font-bold">Сагс</h3>
        </div>

        {!currentUser ? (
          <div className="space-y-4 text-center">
            <p className="text-slate-600">Сагс ашиглахын тулд эхлээд нэвтэрнэ үү.</p>
            <Button className="rounded-2xl" onClick={() => { setCartOpen(false); setAuthMode("login"); setAuthOpen(true); }}>
              Нэвтрэх
            </Button>
          </div>
        ) : cart.length === 0 ? (
          <div className="space-y-4 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-400" />
            <p className="text-slate-600">Таны сагс хоосон байна.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                  <img src={item.image} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-slate-500">{item.category}</p>
                    <p className="mt-1 font-bold">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl" onClick={() => changeQuantity(item.id, -1)}>
                      -
                    </Button>
                    <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                    <Button variant="outline" className="rounded-xl" onClick={() => changeQuantity(item.id, 1)}>
                      +
                    </Button>
                  </div>
                  <Button variant="ghost" className="rounded-xl" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-3xl bg-slate-50 p-5">
              <h4 className="text-lg font-bold">Захиалгын мэдээлэл</h4>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Нийт бараа</span>
                  <span>{cartCount}</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-slate-900">
                  <span>Нийт үнэ</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
              <Button className="mt-5 h-11 w-full rounded-2xl" onClick={confirmOrder}>
                Захиалга баталгаажуулах
              </Button>
              <Button variant="outline" className="mt-3 h-11 w-full rounded-2xl" onClick={handleDeleteAccount}>
                Бүртгэл устгах
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={checkoutDone} onClose={() => setCheckoutDone(false)}>
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16" />
          <h3 className="text-2xl font-bold">Захиалга амжилттай баталгаажлаа</h3>
          <p className="text-slate-600">
            Таны захиалгыг хүлээн авлаа. Удахгүй холбогдох болно.
          </p>
          <Button className="rounded-2xl" onClick={() => setCheckoutDone(false)}>
            Ойлголоо
          </Button>
        </div>
      </Modal>
    </div>
  );
}
