export const up = async function (db: any): Promise<any> {
    return db.runSql(
      `
    INSERT INTO clips (
      client_id,
      path,
      sentence,
      original_sentence_id,
      created_at,
      bucket,
      locale_id,
      needs_votes,
      is_valid,
      validated_at,
      duration,
      modified_by,
      validation_count,
      version
    ) VALUES 
    (
      '0d095b58-a9b0-433f-bb13-137e5e33676c', 
      'https://rasd.green.org:9000/processed/0569e708-92eb-46d4-bd77-cdd5baa6bb2d/en_112df0d556de568ef8c5e07c2d28e52880b605af35431b349135145daf5eb974_1.mp3',
      'Yeah, I watched it.', 
      NULL, 
      NOW(), 
      'train', 
      1, 
      TRUE, 
      TRUE, 
      NULL, 
      120, 
      NULL, 
      0, 
      0
    ),
    (
      '1b1654a6-d473-4fc2-83b7-5bc01f57677b',
      'https://rasd.green.org:9000/processed/0569e708-92eb-46d4-bd77-cdd5baa6bb2d/en_112df0d556de568ef8c5e07c2d28e52880b605af35431b349135145daf5eb974_2.mp3',
      'it was an intense match',
      NULL,
      NOW(),
      'train',
      1,
      TRUE,
      TRUE,
      NULL,
      180,
      NULL,
      0,
      0
    ),
    (
      '2c093c46-b7c5-41d5-8f3e-d9cfa8d446ed',
      'https://rasd.green.org:9000/processed/0569e708-92eb-46d4-bd77-cdd5baa6bb2d/en_112df0d556de568ef8c5e07c2d28e52880b605af35431b349135145daf5eb974_3.mp3',
      'What did you think?',
      NULL,
      NOW(),
      'train',
      1,
      TRUE,
      TRUE,
      NULL,
      150,
      NULL,
      0,
      0
    );
  
      `
    );
  };
  
  export const down = function (): Promise<any> {
    return null;
  };
  