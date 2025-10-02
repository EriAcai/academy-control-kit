import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { StudentsTable } from "@/components/StudentsTable";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: students, isLoading, refetch } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("nome_completo");

      if (error) throw error;
      return data;
    },
  });

  const filteredStudents = students?.filter(
    (student) =>
      student.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Alunos</h1>
            <p className="text-muted-foreground">
              Cadastre e gerencie todos os alunos da instituição
            </p>
          </div>
          <Link to="/alunos/novo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Aluno
            </Button>
          </Link>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Lista de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredStudents && filteredStudents.length > 0 ? (
              <StudentsTable students={filteredStudents} onDelete={refetch} />
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {searchTerm
                  ? "Nenhum aluno encontrado com esses critérios."
                  : "Nenhum aluno cadastrado. Clique em 'Novo Aluno' para começar."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
