"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center group-hover:animate-pulse-glow transition-all">
              <span className="text-white text-xl">☀️</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              SunSync
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/planos">
              <Button variant="ghost" className="hover:bg-amber-50 dark:hover:bg-amber-950">
                Planos
              </Button>
            </Link>
            {/* <Link href="/login">
              <Button variant="outline" className="border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950 transition-all hover:scale-105">
                Entrar
              </Button>
            </Link> 
            <Link href="/planos">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40">
                Começar Grátis
              </Button>
            </Link> */}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <section className="text-center max-w-4xl mx-auto mb-16 animate-slide-up">
          <div className="inline-block mb-6">
            <span className="text-6xl animate-float inline-block">☀️</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Gerencie seu Studio de Bronzeamento
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo para agendamentos, controle de clientes e gestão de sessões de bronzeamento. Simplifique sua rotina e aumente sua produtividade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://wa.me/556192415188" target="_blank">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 text-lg px-8 py-6 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40 active:scale-95">
                Saiba Mais 💬
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950 text-lg px-8 py-6 transition-all hover:scale-105 active:scale-95">
                Ver Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-2 animate-slide-up stagger-1 card-glow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                <span className="text-2xl">📅</span>
              </div>
              <CardTitle className="text-xl">Agendamentos</CardTitle>
              <CardDescription>
                Gerencie todos os agendamentos do seu studio em um só lugar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✓</span> Calendário interativo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✓</span> Confirmação automática
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✓</span> Lembretes por WhatsApp
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-2 animate-slide-up stagger-2 card-glow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-2">
                <span className="text-2xl">👥</span>
              </div>
              <CardTitle className="text-xl">Clientes</CardTitle>
              <CardDescription>
                Histórico completo e preferências de cada cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-orange-500">✓</span> Perfil personalizado
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-500">✓</span> Histórico de sessões
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-500">✓</span> Tipo de pele e cuidados
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-2 animate-slide-up stagger-3 card-glow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-xl">Relatórios</CardTitle>
              <CardDescription>
                Acompanhe o desempenho do seu negócio em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">✓</span> Dashboard completo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">✓</span> Faturamento mensal
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">✓</span> Clientes mais frequentes
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Stats Section */}
        <section className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { number: "500+", label: "Clientes Satisfeitos", icon: "😊" },
            { number: "10k+", label: "Sessões Realizadas", icon: "☀️" },
            { number: "98%", label: "Taxa de Satisfação", icon: "⭐" },
            { number: "24/7", label: "Sistema Online", icon: "🌐" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center p-6 rounded-xl bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm border border-amber-200/50 dark:border-amber-800/50 animate-slide-up stagger-${i + 1}`}
            >
              <span className="text-2xl block mb-2">{stat.icon}</span>
              <p className="text-3xl font-bold text-amber-600">{stat.number}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="text-center mt-16 p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800 max-w-3xl mx-auto animate-scale-in glass">
          <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-muted-foreground mb-6">
            Junte-se a centenas de profissionais que já usam o SunSync para gerenciar seus studios.
          </p>
          <Link href="/planos">
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-xl active:scale-95">
              Ver Planos - A partir de R$ 49,90/mês
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-amber-200 dark:border-amber-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-white text-sm">☀️</span>
            </div>
            <span className="font-semibold text-amber-600">SunSync</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 SunSync. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
