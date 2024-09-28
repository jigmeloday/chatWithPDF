'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from '@/components/ui/button';

function UploadButton() {
    const [isOpen, setOpen] = useState(false);

    return(
       <Dialog open={isOpen} onOpenChange={(visible) => setOpen(visible)} >
           <DialogTrigger asChild>
               <Button>
                   Upload PDF
               </Button>
           </DialogTrigger>
           <DialogContent>Example</DialogContent>
       </Dialog>
    )
}

export default UploadButton;
