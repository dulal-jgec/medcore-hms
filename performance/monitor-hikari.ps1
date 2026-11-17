$baseUrl = "http://localhost:8080/actuator/metrics/hikaricp.connections"
$csvFile = ".\hikari-metrics.csv"
$duration = 40

$metrics = @("active", "idle", "pending", "max")
$results = [System.Collections.Generic.List[object]]::new()

# Remove old CSV data
if (Test-Path $csvFile) {
    Remove-Item $csvFile
}

Write-Host "HikariCP Monitoring Started..."
Write-Host "Duration: $duration seconds"

$startTime = Get-Date
$endTime = $startTime.AddSeconds($duration)

while ((Get-Date) -lt $endTime) {

    $row = [ordered]@{
        Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff")
    }

    foreach ($metric in $metrics) {

        try {
            $response = Invoke-RestMethod `
                -Uri "$baseUrl.$metric" `
                -TimeoutSec 3

            $row[$metric] = [double]$response.measurements[0].value
        }
        catch {
            $row[$metric] = -1
        }
    }

    $results.Add([PSCustomObject]$row)

    Start-Sleep -Milliseconds 200
}

# Save fresh data
$results | Export-Csv -Path $csvFile -NoTypeInformation

Write-Host "`n========== HIKARI MONITORING REPORT =========="

Write-Host "Total Samples: $($results.Count)"

foreach ($metric in $metrics) {

    $values = @(
        $results | ForEach-Object { $_.$metric } |
        Where-Object { $_ -ge 0 }
    )

    if ($values.Count -gt 0) {

        $maxValue = ($values | Measure-Object -Maximum).Maximum
        $avgValue = ($values | Measure-Object -Average).Average

        Write-Host "$metric : Maximum = $maxValue | Average = $([math]::Round($avgValue, 2))"
    }
}

Write-Host "`nCSV saved: $csvFile"