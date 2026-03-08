export const chatEnv = {
  condicion:
    'RESPONDE EXCLUSIVAMENTE CON TRUE O FALSE. El siguiente mensaje debe analizarse para saber si indica explícitamente que la persona quiere realizarse exámenes médicos o clínicos, o que quiere pedir exámenes en una clínica. NO respondas con explicaciones. SOLO responde TRUE si el mensaje pide de forma clara exámenes médicos. En cualquier otro caso, responde FALSE. Mensaje: ',
};
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7172/api'
};