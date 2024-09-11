export const up = async function (db: any): Promise<any> {
  const [row] = await db.runSql("SHOW TABLES LIKE 'version';");
  // If the version table exists, the user already has all the tables below
  return db.runSql(
    row
      ? `
      DROP TABLE version
      `
      : `

     CREATE TABLE user_clients (
        client_id CHAR(36) NOT NULL PRIMARY KEY,
        email VARCHAR(255) DEFAULT NULL,
        accent VARCHAR(255) DEFAULT NULL,
        age VARCHAR(255) DEFAULT NULL,
        gender VARCHAR(255) DEFAULT NULL,
        UNIQUE full_index (client_id, email),
        KEY email_index (email)
      );
      
      CREATE TABLE users (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) DEFAULT NULL,
        send_emails BOOLEAN NOT NULL DEFAULT FALSE,
        has_downloaded BOOLEAN NOT NULL DEFAULT FALSE,
        UNIQUE KEY email (email)
      );
      
      CREATE TABLE sentences (
        id VARCHAR(255) NOT NULL,
        text TEXT CHARACTER SET utf8 NOT NULL,
        is_used BOOLEAN DEFAULT FALSE NOT NULL,
        PRIMARY KEY (id)
      );

      CREATE TABLE clips (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        client_id CHAR(36) NOT NULL,
        path VARCHAR(255) NOT NULL,
        sentence TEXT CHARACTER SET utf8mb4 NOT NULL,
        original_sentence_id VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        bucket ENUM('train', 'dev', 'test') DEFAULT 'train',
        locale_id INT NOT NULL DEFAULT 1,
        needs_votes BOOLEAN DEFAULT TRUE,
        is_valid BOOLEAN,
        validated_at DATE DEFAULT NULL,
        duration INT NOT NULL DEFAULT 0,
        modified_by CHAR(36),
        validation_count INT NOT NULL DEFAULT 0,
        version INT NOT NULL DEFAULT 0,

        UNIQUE KEY client_sentence_index (client_id, original_sentence_id),
        UNIQUE KEY path_index (path),
        KEY original_sentence_id (original_sentence_id),
        INDEX needs_votes_idx (needs_votes),
        INDEX created_at_idx (created_at),
        INDEX is_valid_idx (is_valid),
        INDEX is_valid_locale_id_idx (is_valid, locale_id)
      );
   
      CREATE TABLE votes (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        clip_id BIGINT(20) UNSIGNED NOT NULL,
        is_valid TINYINT(1) DEFAULT NULL,
        client_id CHAR(36) NOT NULL,
        transcription TEXT CHARACTER SET utf8,
        UNIQUE KEY clip_client_index (clip_id,client_id),
        KEY client_id (client_id)
       -- CONSTRAINT votes_ibfk_1 FOREIGN KEY (clip_id) REFERENCES clips (id),
       -- CONSTRAINT votes_ibfk_2 FOREIGN KEY (client_id) REFERENCES user_clients (client_id)
      );

      CREATE TABLE client_language (
        client_id CHAR(36) NOT NULL,
        language CHAR(3)
      );

    `
  );
};

export const down = function (): Promise<any> {
  return null;
};
