'use client';

import CallbackForm from '@/components/forms/CallbackForm';
import CommercialOfferForm from '@/components/forms/CommercialOfferForm';
import { Button, Modal } from '@/components/ui';
import { FileText, Phone } from 'lucide-react';
import { useState } from 'react';

interface ProductLeadActionsProps {
  productId: string;
}

export default function ProductLeadActions({ productId }: ProductLeadActionsProps) {
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [kpOpen, setKpOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="primary"
          size="lg"
          leftIcon={<Phone className="h-5 w-5" aria-hidden />}
          fullWidth
          onClick={() => setCallbackOpen(true)}
        >
          Заказать звонок
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          leftIcon={<FileText className="h-5 w-5" aria-hidden />}
          fullWidth
          onClick={() => setKpOpen(true)}
        >
          Получить КП
        </Button>
      </div>

      <Modal
        isOpen={callbackOpen}
        onClose={() => setCallbackOpen(false)}
        title="Заказать звонок"
        size="sm"
      >
        <CallbackForm productId={productId} onSuccess={() => setCallbackOpen(false)} />
      </Modal>

      <Modal
        isOpen={kpOpen}
        onClose={() => setKpOpen(false)}
        title="Получить коммерческое предложение"
        size="md"
      >
        <CommercialOfferForm productId={productId} onSuccess={() => setKpOpen(false)} />
      </Modal>
    </>
  );
}
