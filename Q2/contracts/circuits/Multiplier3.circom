pragma circom 2.0.0;

template Multiplier2 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;  
   signal output c;  

   // Constraints.  
   c <== a * b;  
}

// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output d; 
   component multi1 = Multiplier2();
   component multi2 = Multiplier2();

   //statement
   multi1.a <== a;
   multi1.b <== b;
   multi2.a <== multi1.c;
   multi2.b <== c;
   d <== multi2.c;
   
}

component main = Multiplier3();