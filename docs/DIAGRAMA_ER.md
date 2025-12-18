erDiagram
    %% =========================
    %% ENTIDAD CENTRAL
    %% =========================
    USERS ||--o{ FAVORITES : "tiene"
    USERS ||--o{ REVIEWS : "escribe"

    %% =========================
    %% ENTIDADES EXTERNAS (TMDb)
    %% No persistidas localmente
    %% =========================
    TMDB_MOVIES ||--o{ FAVORITES : "puede ser"
    TMDB_SERIES ||--o{ FAVORITES : "puede ser"
    TMDB_ACTORS ||--o{ FAVORITES : "puede ser"

    TMDB_MOVIES ||--o{ REVIEWS : "recibe"
    TMDB_SERIES ||--o{ REVIEWS : "recibe"

    %% =========================
    %% DEFINICIÓN DE ENTIDADES
    %% =========================

    USERS {
        int id PK "Identificador único"
        string nombre "Nombre del usuario"
        string apellido "Apellido del usuario"
        string email UK "Correo electrónico único"
        string password "Contraseña hasheada"
        string telefono "Número de teléfono"
        string avatar_url "URL del avatar"
        datetime created_at "Fecha de creación"
        datetime updated_at "Fecha de actualización"
    }

    %% =========================
    %% ENTIDADES EXTERNAS TMDb
    %% =========================

    TMDB_MOVIES {
        string tmdb_id PK "ID de película en TMDb"
        string title "Título"
        text overview "Descripción"
        string release_date "Fecha de estreno"
        float vote_average "Puntuación promedio"
        string poster_path "Ruta del póster"
    }

    TMDB_SERIES {
        string tmdb_id PK "ID de serie en TMDb"
        string name "Nombre"
        text overview "Descripción"
        string first_air_date "Fecha de estreno"
        float vote_average "Puntuación promedio"
        string poster_path "Ruta del póster"
    }

    TMDB_ACTORS {
        string tmdb_id PK "ID de actor en TMDb"
        string name "Nombre del actor"
        string profile_path "Foto de perfil"
        text biography "Biografía"
        float popularity "Popularidad"
    }

    %% =========================
    %% ENTIDADES PERSISTIDAS
    %% =========================

    FAVORITES {
        int id PK "Identificador único"
        int user_id FK "Usuario propietario"
        string item_type "movie | series | actor"
        string item_tmdb_id "ID TMDb del item"
        datetime created_at "Fecha de creación"
    }

    REVIEWS {
        int id PK "Identificador único"
        int user_id FK "Usuario autor"
        string item_type "movie | series"
        string item_tmdb_id "ID TMDb del item"
        int rating "Puntuación (1–10)"
        text review_text "Texto de la reseña"
        datetime created_at "Fecha de creación"
        datetime updated_at "Fecha de actualización"
    }
