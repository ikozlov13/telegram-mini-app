const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImages(directory) {
    try {
        const files = await fs.readdir(directory);
        
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isDirectory()) {
                await optimizeImages(filePath);
                continue;
            }
            
            if (!['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())) {
                continue;
            }
            
            // Создаем WebP версию
            const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            await sharp(filePath)
                .webp({ quality: 80 })
                .toFile(webpPath);
            
            // Оптимизируем оригинал
            await sharp(filePath)
                .jpeg({ quality: 80, progressive: true })
                .toFile(filePath + '.optimized');
            
            await fs.rename(filePath + '.optimized', filePath);
            
            console.log(`Оптимизировано: ${filePath}`);
        }
    } catch (error) {
        console.error('Ошибка при оптимизации:', error);
    }
}

// Запускаем оптимизацию
optimizeImages(path.join(__dirname, '../public/images')); 