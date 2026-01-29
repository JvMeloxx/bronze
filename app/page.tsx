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
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-white text-xl">☀️</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              SunSync
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" className="border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30">
                Cadastrar
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <section className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Gerencie seu Studio de Bronzeamento
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo para agendamentos, controle de clientes e gestão de sessões de bronzeamento. Simplifique sua rotina e aumente sua produtividade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 text-lg px-8 py-6">
                Acessar Sistema
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button size="lg" variant="outline" className="border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950 text-lg px-8 py-6">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
                <span className="text-2xl">📅</span>
              </div>
              <CardTitle className="text-xl">Agendamentos</CardTitle>
              <CardDescription>
                Gerencie todos os agendamentos do seu studio em um só lugar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Calendário interativo</li>
                <li>• Confirmação automática</li>
                <li>• Lembretes por WhatsApp</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
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
                <li>• Perfil personalizado</li>
                <li>• Histórico de sessões</li>
                <li>• Tipo de pele e cuidados</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
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
                <li>• Dashboard completo</li>
                <li>• Faturamento mensal</li>
                <li>• Clientes mais frequentes</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-16 p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-muted-foreground mb-6">
            Junte-se a centenas de profissionais que já usam o SunSync para gerenciar seus studios.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30">
              Começar Agora - É Grátis
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
