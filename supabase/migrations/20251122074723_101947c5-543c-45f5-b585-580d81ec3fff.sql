-- Add blockchain anchoring fields to verifiable_credentials table
ALTER TABLE public.verifiable_credentials
ADD COLUMN blockchain_network VARCHAR(50),
ADD COLUMN blockchain_tx_hash VARCHAR(255),
ADD COLUMN blockchain_block_number BIGINT,
ADD COLUMN blockchain_anchored_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN credential_hash VARCHAR(255);

-- Create index for faster blockchain lookups
CREATE INDEX idx_verifiable_credentials_tx_hash 
ON public.verifiable_credentials(blockchain_tx_hash);

-- Add comment for documentation
COMMENT ON COLUMN public.verifiable_credentials.blockchain_network IS 'Blockchain network used for anchoring (e.g., ethereum, polygon, bitcoin)';
COMMENT ON COLUMN public.verifiable_credentials.blockchain_tx_hash IS 'Transaction hash of the blockchain anchor';
COMMENT ON COLUMN public.verifiable_credentials.blockchain_block_number IS 'Block number where credential was anchored';
COMMENT ON COLUMN public.verifiable_credentials.credential_hash IS 'SHA-256 hash of the credential JSON for blockchain verification';