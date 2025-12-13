erDiagram
    USERS ||--o{ FAVORITES : has
    MOVIES ||--o{ FAVORITES : "is favorited"
    SERIES ||--o{ FAVORITES : "is favorited"
    ACTORS ||--o{ FAVORITES : "is favorited"
    
    USERS {
        int id PK
        string nombre
        string apellido
        string email UK
        string telefono
        datetime created_at
        datetime updated_at
    }
    
    MOVIES {
        int id PK
        string tmdb_id UK "ID de TMDb"
        string title
        text overview
        string release_date
        float vote_average
        string poster_path
        text genre_ids "JSON array"
        datetime created_at
        datetime updated_at
    }
    
    SERIES {
        int id PK
        string tvmaze_id UK "ID de TVMaze"
        string name
        text summary
        string premiered
        string status
        text genres "JSON array"
        string network
        string image_url
        datetime created_at
        datetime updated_at
    }
    
    ACTORS {
        int id PK
        string tmdb_id UK "ID de TMDb"
        string name
        float popularity
        text known_for "JSON array"
        string profile_path
        text biography
        datetime created_at
        datetime updated_at
    }
    
    FAVORITES {
        int id PK
        int user_id FK
        string item_type "movie, series, actor"
        int item_id FK "Referencias a MOVIES, SERIES o ACTORS"
        datetime created_at
    }