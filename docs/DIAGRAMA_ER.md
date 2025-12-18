erDiagram
    %% Entidad central: Usuarios
    USERS ||--o{ FAVORITES : "tiene favoritos"
    USERS ||--o{ REVIEWS : "escribe reseñas"

    %% Entidades de contenido multimedia
    MOVIES ||--o{ FAVORITES : "es favorito"
    MOVIES ||--o{ REVIEWS : "tiene reseñas"
    SERIES ||--o{ FAVORITES : "es favorito"
    SERIES ||--o{ REVIEWS : "tiene reseñas"
    ACTORS ||--o{ FAVORITES : "es favorito"

    %% Definición de entidades con atributos
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

    MOVIES {
        int id PK "Identificador único"
        string tmdb_id UK "ID de TMDb"
        string title "Título de la película"
        text overview "Descripción"
        string release_date "Fecha de lanzamiento"
        float vote_average "Puntuación promedio"
        int vote_count "Número de votos"
        string poster_path "Ruta del póster"
        string backdrop_path "Ruta del fondo"
        text genre_ids "Géneros (JSONB)"
        int runtime "Duración en minutos"
        string original_language "Idioma original"
        datetime created_at "Fecha de creación"
        datetime updated_at "Fecha de actualización"
    }

    SERIES {
        int id PK "Identificador único"
        string tmdb_id UK "ID de TMDb"
        string name "Nombre de la serie"
        text overview "Descripción"
        string first_air_date "Fecha de estreno"
        float vote_average "Puntuación promedio"
        int vote_count "Número de votos"
        string poster_path "Ruta del póster"
        string backdrop_path "Ruta del fondo"
        text genre_ids "Géneros (JSONB)"
        int number_of_seasons "Número de temporadas"
        int number_of_episodes "Número de episodios"
        string original_language "Idioma original"
        datetime created_at "Fecha de creación"
        datetime updated_at "Fecha de actualización"
    }

    ACTORS {
        int id PK "Identificador único"
        string tmdb_id UK "ID de TMDb"
        string name "Nombre del actor"
        string profile_path "Ruta de la foto de perfil"
        text biography "Biografía"
        string birthday "Fecha de nacimiento"
        string deathday "Fecha de fallecimiento"
        string place_of_birth "Lugar de nacimiento"
        string known_for_department "Departamento conocido"
        float popularity "Popularidad"
        datetime created_at "Fecha de creación"
        datetime updated_at "Fecha de actualización"
    }

    FAVORITES {
        int id PK "Identificador único"
        int user_id FK "ID del usuario"
        string item_type "Tipo: movie/series/actor"
        string item_id "ID del item (tmdb_id)"
        string tmdb_id "ID de TMDb del item"
        datetime created_at "Fecha de creación"
    }

    REVIEWS {
        int id PK "Identificador único"
        int user_id FK "ID del usuario"
        string item_type "Tipo: movie/series"
        string item_id "ID del item (tmdb_id)"
        string tmdb_id "ID de TMDb del item"
        int rating "Puntuación 1-10"
        text review_text "Texto de la reseña"
        boolean is_favorite "Marcado como favorito"
        datetime created_at "Fecha de creación"
        datetime updated_at "Fecha de actualización"
    }