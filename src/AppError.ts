// 1. "extends Error" means we are copying the built-in JavaScript Error class
// and adding our own custom features to it.
export class AppError extends Error {
  
  // 2. We are telling TypeScript: "Hey, this custom error is going to 
  // have a number attached to it called statusCode."
  statusCode: number;
  // 3. The constructor is runs automatically the moment you write:
  // new AppError("Invalid Password", 401)
  constructor(message: string, statusCode: number) {
      
    // 4. "super(message)" is required when you "extend". 
    // It says: "Hey original Error class, please do your normal job 
    // and save this message for me."
    super(message);
    
    // 5. Finally, we attach the status code (like 401 or 400) to the error object!
    this.statusCode = statusCode;
  }
}