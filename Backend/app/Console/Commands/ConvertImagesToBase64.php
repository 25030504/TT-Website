<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\News;

class ConvertImagesToBase64 extends Command
{
    protected $signature = 'images:convert-base64';

    protected $description = 'Convierte URLs de imágenes a Base64 y actualiza la base de datos';

    public function handle()
    {
        $newsList = News::all();

        foreach ($newsList as $news) {

            // Saltar si ya está en Base64
            if (str_starts_with($news->image, 'data:image')) {
                $this->info("Ya convertido ID {$news->id}");
                continue;
            }

            try {
                $response = Http::timeout(20)->get($news->image);

                if (!$response->successful()) {
                    $this->error("No se pudo descargar imagen ID {$news->id}");
                    continue;
                }

                $imageContent = $response->body();

                // Detectar tipo MIME
                $mimeType = $response->header('Content-Type');

                // Convertir a base64
                $base64 = 'data:' . $mimeType . ';base64,' .
                    base64_encode($imageContent);

                // Actualizar BD
                $news->update([
                    'image' => $base64
                ]);

                $this->info("Convertido ID {$news->id}");
            } catch (\Exception $e) {
                $this->error(
                    "Error ID {$news->id}: " .
                    $e->getMessage()
                );
            }
        }

        $this->info('Proceso terminado.');
    }
}