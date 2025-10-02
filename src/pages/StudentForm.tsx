import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

const studentSchema = z.object({
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  nome_completo: z.string().min(3, "Nome completo deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string().optional(),
  data_nascimento: z.string().optional(),
  curso: z.string().min(1, "Curso é obrigatório"),
  status: z.enum(["Ativo", "Trancado", "Concluído"]),
});

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: student, isLoading: isLoadingStudent } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      matricula: formData.get("matricula") as string,
      nome_completo: formData.get("nome_completo") as string,
      email: formData.get("email") as string,
      cpf: formData.get("cpf") as string || null,
      data_nascimento: formData.get("data_nascimento") as string || null,
      curso: formData.get("curso") as string,
      status: formData.get("status") as string,
    };

    try {
      studentSchema.parse(data);

      if (isEdit && id) {
        const { error } = await supabase
          .from("students")
          .update(data)
          .eq("id", id);

        if (error) throw error;
        toast.success("Aluno atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("students")
          .insert([{ ...data, created_by: user?.id }]);

        if (error) throw error;
        toast.success("Aluno cadastrado com sucesso!");
      }

      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error("Erro ao salvar aluno");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEdit && isLoadingStudent) {
    return (
      <Layout>
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Card className="shadow-card-hover">
          <CardHeader>
            <CardTitle>
              {isEdit ? "Editar Aluno" : "Cadastrar Novo Aluno"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula *</Label>
                  <Input
                    id="matricula"
                    name="matricula"
                    defaultValue={student?.matricula}
                    required
                  />
                  {errors.matricula && (
                    <p className="text-sm text-destructive">{errors.matricula}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select name="status" defaultValue={student?.status || "Ativo"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Trancado">Trancado</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-destructive">{errors.status}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  name="nome_completo"
                  defaultValue={student?.nome_completo}
                  required
                />
                {errors.nome_completo && (
                  <p className="text-sm text-destructive">{errors.nome_completo}</p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={student?.email}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    defaultValue={student?.cpf || ""}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && (
                    <p className="text-sm text-destructive">{errors.cpf}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    name="data_nascimento"
                    type="date"
                    defaultValue={student?.data_nascimento || ""}
                  />
                  {errors.data_nascimento && (
                    <p className="text-sm text-destructive">
                      {errors.data_nascimento}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="curso">Curso *</Label>
                  <Input
                    id="curso"
                    name="curso"
                    defaultValue={student?.curso}
                    placeholder="Ex: Engenharia de Software"
                    required
                  />
                  {errors.curso && (
                    <p className="text-sm text-destructive">{errors.curso}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading
                    ? "Salvando..."
                    : isEdit
                    ? "Atualizar"
                    : "Cadastrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
