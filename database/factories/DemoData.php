<?php

namespace Database\Factories;

class DemoData
{
    public static function jobTitles(): array
    {
        return [
            'Frontend Developer Intern',
            'Backend Developer Intern',
            'Full Stack Developer Intern',
            'Data Analyst Intern',
            'Machine Learning Intern',
            'UI/UX Designer Intern',
            'DevOps Intern',
            'Mobile Developer Intern',
            'Cybersecurity Intern',
            'QA Automation Intern',
            'Business Intelligence Intern',
            'Cloud Engineering Intern',
        ];
    }

    public static function skills(): array
    {
        return [
            'agile',
            'aws',
            'c',
            'c#',
            'css',
            'docker',
            'express',
            'figma',
            'git',
            'html',
            'java',
            'javascript',
            'jira',
            'laravel',
            'linux',
            'mongodb',
            'mysql',
            'node.js',
            'numpy',
            'php',
            'python',
            'react',
            'scrum',
            'sql',
            'tailwind',
            'tensorflow',
            'typescript',
            'vue',
        ];
    }

    public static function skillsForTitle(string $title): array
    {
        $base = [
            'agile',
            'git',
            'jira',
            'scrum',
            'sql',
        ];

        $groups = [
            'Frontend' => ['html', 'css', 'javascript', 'typescript', 'react', 'vue', 'tailwind', 'figma'],
            'Backend' => ['php', 'laravel', 'node.js', 'express', 'mysql', 'mongodb', 'docker'],
            'Full Stack' => ['html', 'css', 'react', 'node.js', 'laravel', 'mysql', 'docker'],
            'Data Analyst' => ['python', 'sql', 'numpy', 'mysql', 'figma'],
            'Machine Learning' => ['python', 'numpy', 'tensorflow', 'sql', 'linux'],
            'UI/UX' => ['figma', 'html', 'css', 'agile'],
            'DevOps' => ['linux', 'docker', 'aws', 'git', 'mysql'],
            'Mobile' => ['java', 'javascript', 'typescript', 'node.js', 'git'],
            'Cybersecurity' => ['linux', 'python', 'sql', 'docker', 'aws'],
            'QA' => ['javascript', 'python', 'git', 'agile', 'jira'],
            'Business Intelligence' => ['sql', 'python', 'mysql', 'numpy'],
            'Cloud' => ['aws', 'linux', 'docker', 'python', 'mysql'],
        ];

        foreach ($groups as $keyword => $skills) {
            if (str_contains($title, $keyword)) {
                return array_values(array_unique([...$skills, ...$base]));
            }
        }

        return self::skills();
    }

    public static function moroccanCities(): array
    {
        return ['Casablanca', 'Rabat', 'Marrakesh', 'Tangier', 'Fes', 'Agadir', 'Remote', 'Hybrid - Casablanca'];
    }

    public static function internshipTypes(): array
    {
        return ['Remote', 'Hybrid', 'On-site', 'Full-time', 'Part-time'];
    }

    public static function universities(): array
    {
        return [
            'Université Hassan II Casablanca',
            'Mohammed V University Rabat',
            'Al Akhawayn University',
            'ENSIAS Rabat',
            'EMSI Casablanca',
            'INPT Rabat',
            'Université Cadi Ayyad',
        ];
    }
}
