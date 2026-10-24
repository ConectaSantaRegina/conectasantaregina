export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      acoes: {
        Row: {
          aprovado: boolean
          contato: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          local: string | null
          meta: string | null
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aprovado?: boolean
          contato?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          local?: string | null
          meta?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aprovado?: boolean
          contato?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          local?: string | null
          meta?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comercio_categorias: {
        Row: {
          categoria_pai_id: string | null
          chave: string
          created_at: string
          id: string
          nome: string
          status: string
        }
        Insert: {
          categoria_pai_id?: string | null
          chave: string
          created_at?: string
          id?: string
          nome: string
          status?: string
        }
        Update: {
          categoria_pai_id?: string | null
          chave?: string
          created_at?: string
          id?: string
          nome?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comercio_categorias_categoria_pai_id_fkey"
            columns: ["categoria_pai_id"]
            isOneToOne: false
            referencedRelation: "comercio_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      comercio_subcategorias: {
        Row: {
          comercio_id: string
          subcategoria_id: string
        }
        Insert: {
          comercio_id: string
          subcategoria_id: string
        }
        Update: {
          comercio_id?: string
          subcategoria_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comercio_subcategorias_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comercio_subcategorias_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "comercio_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      comercios: {
        Row: {
          aprovado: boolean
          categoria: string
          categoria_principal_id: string | null
          categoria_principal_personalizada: string | null
          created_at: string
          delivery: boolean
          descricao: string | null
          endereco: string | null
          fotos_extras: string[]
          horario: string | null
          id: string
          imagem_url: string | null
          instagram: string | null
          nome: string
          secao: string
          subcategorias_personalizadas: string[]
          telefone: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          aprovado?: boolean
          categoria: string
          categoria_principal_id?: string | null
          categoria_principal_personalizada?: string | null
          created_at?: string
          delivery?: boolean
          descricao?: string | null
          endereco?: string | null
          fotos_extras?: string[]
          horario?: string | null
          id?: string
          imagem_url?: string | null
          instagram?: string | null
          nome: string
          secao?: string
          subcategorias_personalizadas?: string[]
          telefone?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          aprovado?: boolean
          categoria?: string
          categoria_principal_id?: string | null
          categoria_principal_personalizada?: string | null
          created_at?: string
          delivery?: boolean
          descricao?: string | null
          endereco?: string | null
          fotos_extras?: string[]
          horario?: string | null
          id?: string
          imagem_url?: string | null
          instagram?: string | null
          nome?: string
          secao?: string
          subcategorias_personalizadas?: string[]
          telefone?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comercios_categoria_principal_id_fkey"
            columns: ["categoria_principal_id"]
            isOneToOne: false
            referencedRelation: "comercio_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_compartilhamentos: {
        Row: {
          created_at: string
          dispositivo_id: string
          publicacao_id: string
        }
        Insert: {
          created_at?: string
          dispositivo_id: string
          publicacao_id: string
        }
        Update: {
          created_at?: string
          dispositivo_id?: string
          publicacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_compartilhamentos_publicacao_id_fkey"
            columns: ["publicacao_id"]
            isOneToOne: false
            referencedRelation: "novidades"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_curtidas: {
        Row: {
          created_at: string
          publicacao_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          publicacao_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          publicacao_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_curtidas_publicacao_id_fkey"
            columns: ["publicacao_id"]
            isOneToOne: false
            referencedRelation: "novidades"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_metricas: {
        Row: {
          compartilhamentos: number
          curtidas: number
          publicacao_id: string
        }
        Insert: {
          compartilhamentos?: number
          curtidas?: number
          publicacao_id: string
        }
        Update: {
          compartilhamentos?: number
          curtidas?: number
          publicacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_metricas_publicacao_id_fkey"
            columns: ["publicacao_id"]
            isOneToOne: true
            referencedRelation: "novidades"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis: {
        Row: {
          aprovado: boolean
          contato: string | null
          created_at: string
          descricao: string | null
          endereco: string | null
          finalidade: string
          id: string
          imagem_url: string | null
          preco: string | null
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aprovado?: boolean
          contato?: string | null
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          finalidade?: string
          id?: string
          imagem_url?: string | null
          preco?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aprovado?: boolean
          contato?: string | null
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          finalidade?: string
          id?: string
          imagem_url?: string | null
          preco?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mensagens_contato: {
        Row: {
          created_at: string
          email: string | null
          id: string
          mensagem: string
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          mensagem: string
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          mensagem?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      novidades: {
        Row: {
          aprovado: boolean
          aprovado_em: string | null
          aprovado_por: string | null
          canal: string
          categoria: string
          created_at: string
          id: string
          imagem_url: string | null
          premium_valido_ate: string | null
          texto: string | null
          titulo: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          aprovado?: boolean
          aprovado_em?: string | null
          aprovado_por?: string | null
          canal?: string
          categoria?: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          premium_valido_ate?: string | null
          texto?: string | null
          titulo: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          aprovado?: boolean
          aprovado_em?: string | null
          aprovado_por?: string | null
          canal?: string
          categoria?: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          premium_valido_ate?: string | null
          texto?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      pedidos_destaque: {
        Row: {
          comercio_id: string | null
          contato: string
          created_at: string
          id: string
          mensagem: string | null
          negocio: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comercio_id?: string | null
          contato: string
          created_at?: string
          id?: string
          mensagem?: string | null
          negocio: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comercio_id?: string | null
          contato?: string
          created_at?: string
          id?: string
          mensagem?: string | null
          negocio?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_destaque_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
        ]
      }
      premium: {
        Row: {
          ativo: boolean
          comercio_id: string | null
          created_at: string
          id: string
          observacao: string | null
          updated_at: string
          user_id: string
          valido_ate: string
        }
        Insert: {
          ativo?: boolean
          comercio_id?: string | null
          created_at?: string
          id?: string
          observacao?: string | null
          updated_at?: string
          user_id: string
          valido_ate: string
        }
        Update: {
          ativo?: boolean
          comercio_id?: string | null
          created_at?: string
          id?: string
          observacao?: string | null
          updated_at?: string
          user_id?: string
          valido_ate?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cadastro_completo_em: string | null
          created_at: string
          id: string
          morador: boolean | null
          nome: string
          onboarding_concluido: boolean
          telefone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          cadastro_completo_em?: string | null
          created_at?: string
          id: string
          morador?: boolean | null
          nome?: string
          onboarding_concluido?: boolean
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          cadastro_completo_em?: string | null
          created_at?: string
          id?: string
          morador?: boolean | null
          nome?: string
          onboarding_concluido?: boolean
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      sugestao_apoios: {
        Row: {
          created_at: string
          id: string
          sugestao_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sugestao_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sugestao_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sugestao_apoios_sugestao_id_fkey"
            columns: ["sugestao_id"]
            isOneToOne: false
            referencedRelation: "sugestoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sugestoes: {
        Row: {
          aprovado: boolean
          created_at: string
          descricao: string | null
          id: string
          local: string | null
          status: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aprovado?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          local?: string | null
          status?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aprovado?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          local?: string | null
          status?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vagas: {
        Row: {
          aprovado: boolean
          contato: string | null
          created_at: string
          descricao: string | null
          empresa: string | null
          id: string
          salario: string | null
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aprovado?: boolean
          contato?: string | null
          created_at?: string
          descricao?: string | null
          empresa?: string | null
          id?: string
          salario?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aprovado?: boolean
          contato?: string | null
          created_at?: string
          descricao?: string | null
          empresa?: string | null
          id?: string
          salario?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      comercios_galeria_premium: { Args: never; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      normalizar_categoria_comercio: {
        Args: { valor: string }
        Returns: string
      }
      premium_ativo: { Args: { _user_id: string }; Returns: boolean }
      registrar_compartilhamento_feed: {
        Args: { p_dispositivo: string; p_publicacao: string }
        Returns: undefined
      }
      salvar_comercio_classificado: {
        Args: {
          p_categoria: string
          p_dados: Json
          p_id?: string
          p_subcategorias: string[]
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
